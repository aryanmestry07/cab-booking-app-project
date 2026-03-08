import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import MapComponent from "../components/MapComponent";
import toast from "react-hot-toast";

function RiderDashboard() {

  const [rides, setRides] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);

  const BASE_FARE = 50;
  const PER_KM = 10;


  // ---------------- Fetch rides ----------------
  const fetchRides = useCallback(async () => {

    try {

      const res = await api.get("/rides/my-rides");
      setRides(res.data || []);

    } catch (err) {
      console.error("Fetch rides error:", err);
    }

  }, []);


  useEffect(() => {
    fetchRides();
  }, [fetchRides]);


  // ---------------- Auto refresh rides ----------------
  useEffect(() => {

    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);

  }, [fetchRides]);


  // ---------------- WebSocket updates ----------------
  useEffect(() => {

    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

    ws.onmessage = (event) => {

      try {

        const data = JSON.parse(event.data);

        if (data.type === "ride_update") {
          toast.success(`Ride status updated: ${data.status}`);
          fetchRides();
        }

      } catch (err) {
        console.error("WebSocket parse error:", err);
      }

    };

    return () => ws.close();

  }, [fetchRides]);


  // ---------------- Fare calculation ----------------
  useEffect(() => {

    if (distance !== null) {

      const estimatedFare = BASE_FARE + distance * PER_KM;
      setFare(Math.round(estimatedFare));

    }

  }, [distance]);


  // ✅ Active ride logic restored
  const activeRide = rides.find(
    (r) => r?.status === "requested" || r?.status === "ongoing"
  );


  // ---------------- Driver location ----------------
  useEffect(() => {

    if (!activeRide?.id) {
      setDriverLocation(null);
      return;
    }

    const fetchDriverLocation = async () => {

      try {

        const res = await api.get(`/rides/driver/location/${activeRide.id}`);

        if (res.data?.lat && res.data?.lon) {

          setDriverLocation({
            lat: res.data.lat,
            lon: res.data.lon
          });

        }

      } catch (err) {
        console.error("Driver location error:", err);
      }

    };

    fetchDriverLocation();

    const interval = setInterval(fetchDriverLocation, 3000);
    return () => clearInterval(interval);

  }, [activeRide?.id]);


  // ---------------- Request Ride ----------------
  const requestRide = async () => {

    if (!pickup || !destination || distance === null) {
      toast.error("Select pickup and destination first");
      return;
    }

    setLoading(true);

    try {

      const res = await api.post("/rides/request", {
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng,
        distance,
        fare_estimate: fare
      });

      console.log("Ride created:", res.data);

      toast.success("Ride requested!");

      setPickup(null);
      setDestination(null);
      setDistance(null);
      setFare(null);

      setMapKey((prev) => prev + 1);

      fetchRides();

    } catch (error) {

      console.error("Ride request failed:", error);
      toast.error(error.response?.data?.detail || "Ride request failed");

    } finally {

      setLoading(false);

    }

  };


  // ---------------- Cancel Ride ----------------
  const cancelRide = async (rideId) => {

    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {

      await api.post(`/rides/cancel/${rideId}`);

      toast.success("Ride cancelled");

      setDriverLocation(null);

      fetchRides();

    } catch (err) {

      toast.error(err.response?.data?.detail || "Failed to cancel ride");

    }

  };


  // ---------------- Geocode ----------------
  const geocodeLocation = async (location, setter) => {

    if (!location) return;

    try {

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );

      const data = await res.json();

      if (data.length > 0) {

        setter({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });

      }

    } catch (err) {
      console.error("Geocode error:", err);
    }

  };


  return (

    <div className="flex bg-[#F6F6F6] min-h-screen font-sans antialiased text-[#1a1a1a">

      <Sidebar role="rider" />

      <main className="ml-64 flex-1">


        {/* HEADER */}
        <div className="p-8 pb-0 max-w-7xl mx-auto">

          <header className="flex justify-between items-end mb-8 border-b border-gray-200 pb-8">

            <div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                  Rider Portal
                </span>
              </div>

              <h1 className="text-4xl font-medium tracking-tighter">
                Your Next Destination
              </h1>

              <p className="text-gray-500 mt-2 text-sm font-light">
                Set your route and request a premium ride in seconds.
              </p>

            </div>

          </header>

        </div>


        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pt-0">


          {/* Booking Panel */}
          <div className="lg:col-span-4">

            <div className="bg-white p-8 rounded-3xl shadow border border-gray-100">

              <h3 className="text-2xl font-medium tracking-tight mb-6">
                Book Ride
              </h3>

              <div className="space-y-4">

                <input
                  placeholder="Pickup Location"
                  className="w-full bg-[#F9F9F9] border-b-2 p-4 text-sm outline-none"
                  onBlur={(e) =>
                    geocodeLocation(e.target.value, setPickup)
                  }
                />

                <input
                  placeholder="Destination"
                  className="w-full bg-[#F9F9F9] border-b-2 p-4 text-sm outline-none"
                  onBlur={(e) =>
                    geocodeLocation(e.target.value, setDestination)
                  }
                />

              </div>


              {distance !== null && (

                <div className="mt-6 p-4 bg-gray-50 flex justify-between">

                  <div>
                    <p className="text-xs text-gray-400">Distance</p>
                    <p className="font-medium">
                      {distance.toFixed(2)} km
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Fare</p>
                    <p className="font-bold text-lg">₹{fare}</p>
                  </div>

                </div>

              )}


              <button
                onClick={requestRide}
                disabled={loading || activeRide || distance === null}
                className="w-full bg-black text-white py-4 mt-6"
              >
                {loading ? "SEARCHING..." : "CONFIRM RIDE"}
              </button>

            </div>

          </div>


          {/* MAP */}
          <div className="lg:col-span-8">

            <div className="bg-white p-4 rounded-3xl border h-[500px]">

              <MapComponent
                key={mapKey}
                pickup={pickup}
                destination={destination}
                setDistance={setDistance}
                driverLocation={driverLocation}
              />

            </div>


            {activeRide && (

              <div className="bg-black text-white p-10 rounded-3xl mt-8 flex justify-between items-center">

                <div>

                  <div className="flex items-center gap-3 mb-4">

                    <StatusBadge status={activeRide.status} />

                    <span className="text-xs uppercase text-gray-400">
                      {activeRide.status === "requested"
                        ? "Searching for Driver"
                        : "Trip In Progress"}
                    </span>

                  </div>

                  <p className="text-4xl font-medium">
                    ₹{activeRide?.fare_estimate ?? 0}
                  </p>

                </div>

                <button
                  onClick={() => cancelRide(activeRide.id)}
                  className="bg-white text-black px-10 py-4 font-bold"
                >
                  Cancel Ride
                </button>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>

  );

}

export default RiderDashboard;