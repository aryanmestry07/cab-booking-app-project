import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

function DriverDashboard() {

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");

  // ---------------- Fetch Rides ----------------
  const fetchAvailableRides = useCallback(async () => {

    if (role !== "driver") return;

    try {

      let available = [];
      let mine = [];

      try {
        const res = await api.get("/rides/available");
        available = res.data || [];
      } catch (err) {
        console.warn("Available rides fetch failed:", err);
      }

      try {
        const res = await api.get("/rides/my-rides");
        mine = res.data || [];
      } catch (err) {
        console.warn("My rides fetch failed:", err);
      }

      const combined = [...available, ...mine];

      const unique = Array.from(
        new Map(combined.map((r) => [r.id, r])).values()
      );

      setRides(unique);

    } catch (err) {
      console.error("Fetch Error:", err);
    }

  }, [role]);


  useEffect(() => {

    if (role !== "driver") return;

    fetchAvailableRides();

    const interval = setInterval(fetchAvailableRides, 5000);

    return () => clearInterval(interval);

  }, [fetchAvailableRides, role]);


  // ---------------- Driver Location ----------------
  useEffect(() => {

    if (role !== "driver") return;

    const sendLocation = () => {

      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async (pos) => {

        try {

          await api.post("/drivers/location", {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });

        } catch (err) {
          console.error("Location update failed:", err.response?.data || err);
        }

      });

    };

    sendLocation();

    const interval = setInterval(sendLocation, 5000);

    return () => clearInterval(interval);

  }, [role]);


  // ---------------- Ride Actions ----------------
  const handleAction = async (rideId, action) => {

    setLoading(true);

    try {

      await api.post(`/rides/${action}/${rideId}`);

      toast.success(
        action === "accept"
          ? "Trip Started"
          : "Trip Completed"
      );

      fetchAvailableRides();

    } catch (err) {

      toast.error(
        err.response?.data?.detail ||
        `Failed to ${action} ride`
      );

    } finally {
      setLoading(false);
    }

  };


  // ---------------- Ride Filters ----------------
  const availableRides = rides.filter((r) => r.status === "requested");
  const activeRides = rides.filter((r) => r.status === "ongoing");


  return (

    <div className="flex h-screen bg-[#0a0a0a] text-white antialiased overflow-hidden">

      <Sidebar role="driver" />

      <main className="flex-1 ml-64 overflow-y-auto relative">

        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold uppercase tracking-[0.3em]">
                Updating Trip...
              </p>
            </div>
          </div>
        )}

        <div className="p-12 max-w-6xl mx-auto">

          {/* Header */}
          <header className="flex justify-between items-end mb-12">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  System Live
                </span>
              </div>

              <h1 className="text-5xl font-medium tracking-tighter">
                Driver Partner
              </h1>
            </div>

            <button
              onClick={fetchAvailableRides}
              className="px-6 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Sync Dashboard
            </button>

          </header>

          <div className="grid grid-cols-1 gap-12">

            {/* ACTIVE TRIP */}
            <section>

              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-4">
                Active Assignment
                <div className="flex-1 h-px bg-white/5"></div>
              </h2>

              {activeRides.length > 0 ? (

                activeRides.map((ride) => (

                  <div
                    key={ride.id}
                    className="bg-white text-black p-10 flex flex-col md:flex-row justify-between items-center"
                  >

                    <div className="mb-6 md:mb-0">

                      <div className="flex items-center gap-4 mb-2">
                        <StatusBadge status={ride.status} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          ID: {ride.id.slice(-6)}
                        </span>
                      </div>

                      <h3 className="text-3xl font-medium tracking-tight mb-2">
                        Rider: {ride.rider_name || "Guest"}
                      </h3>

                      <p className="text-lg text-gray-600 italic">
                        Distance: {ride.distance?.toFixed(2)} km
                      </p>

                    </div>

                    <div className="text-center md:text-right flex flex-col items-center md:items-end gap-6">

                      <p className="text-5xl font-medium tracking-tighter">
                        ₹{ride.fare_estimate}
                      </p>

                      <button
                        onClick={() => handleAction(ride.id, "complete")}
                        className="bg-black text-white px-12 py-4 font-bold text-sm tracking-widest uppercase hover:bg-gray-800 transition-all"
                      >
                        Complete Trip
                      </button>

                    </div>

                  </div>

                ))

              ) : (

                <div className="border border-white/10 p-12 text-center text-gray-600 italic font-light">
                  No active assignments.
                </div>

              )}

            </section>


            {/* AVAILABLE REQUESTS */}
            <section>

              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-4">
                Available Requests
                <div className="flex-1 h-px bg-white/5"></div>
              </h2>

              {availableRides.length === 0 ? (

                <div className="bg-[#111] p-16 text-center border border-white/5">
                  <p className="text-gray-500 text-sm tracking-widest font-medium uppercase">
                    Scanning for nearby riders...
                  </p>
                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {availableRides.map((ride) => (

                    <div
                      key={ride.id}
                      className="bg-[#111] border border-white/5 p-8 hover:border-white/20 transition-all"
                    >

                      <div className="flex justify-between items-start mb-8">

                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Incoming Request
                          </p>

                          <h4 className="text-xl font-medium tracking-tight text-white">
                            {ride.rider_name || "Guest Rider"}
                          </h4>
                        </div>

                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                          {ride.distance?.toFixed(1)} km
                        </p>

                      </div>

                      <div className="flex justify-between items-end">

                        <p className="text-3xl font-medium tracking-tighter text-white">
                          ₹{ride.fare_estimate}
                        </p>

                        <button
                          onClick={() => handleAction(ride.id, "accept")}
                          className="bg-white text-black px-6 py-3 font-bold text-[10px] tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          Accept
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </div>

        </div>

      </main>

    </div>

  );

}

export default DriverDashboard;