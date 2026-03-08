import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";

const mumbai = [19.076, 72.8777];

/* ---------------- FIX LEAFLET ICONS ---------------- */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- CUSTOM ICONS ---------------- */

const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32]
});

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32]
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [35, 35]
});

/* ---------------- ROUTING ---------------- */

function Routing({ pickup, destination, setDistance }) {

  const map = useMap();

  useEffect(() => {

    if (!pickup || !destination) return;

    const routing = L.Routing.control({

      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(destination.lat, destination.lng)
      ],

      lineOptions: {
        styles: [{ color: "#2563eb", weight: 5 }]
      },

      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false

    }).addTo(map);


    routing.on("routesfound", (e) => {

      const route = e.routes[0];

      const km = route.summary.totalDistance / 1000;

      setDistance(km);

      map.fitBounds(route.coordinates);

    });


    return () => {

      map.removeControl(routing);

    };

  }, [pickup, destination, map, setDistance]);

  return null;
}


/* ---------------- DRIVER MARKER ---------------- */

function DriverMarker({ driverLocation }) {

  const map = useMap();

  useEffect(() => {

    if (!driverLocation) return;

    map.panTo([driverLocation.lat, driverLocation.lon]);

  }, [driverLocation, map]);

  if (
    !driverLocation ||
    driverLocation.lat === null ||
    driverLocation.lon === null
  ) {
    return null;
  }

  return (
    <Marker
      position={[driverLocation.lat, driverLocation.lon]}
      icon={driverIcon}
    />
  );
}


/* ---------------- MAIN MAP ---------------- */

function MapComponent({ pickup, destination, setDistance, driverLocation }) {

  return (

    <MapContainer
      center={mumbai}
      zoom={13}
      style={{ height: "450px", width: "100%" }}
    >

      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pickup && (
        <Marker
          position={[pickup.lat, pickup.lng]}
          icon={pickupIcon}
        />
      )}

      {destination && (
        <Marker
          position={[destination.lat, destination.lng]}
          icon={destinationIcon}
        />
      )}

      <DriverMarker driverLocation={driverLocation} />

      <Routing
        pickup={pickup}
        destination={destination}
        setDistance={setDistance}
      />

    </MapContainer>

  );
}

export default MapComponent;