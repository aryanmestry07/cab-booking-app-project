import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

function RiderDashboard() {
  const [rides, setRides] = useState([]);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRides = useCallback(async () => {
    try {
      const res = await api.get("/rides/my-rides");
      setRides(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 10000);
    return () => clearInterval(interval);
  }, [fetchRides]);

  const requestRide = async () => {
    if (!pickup || !drop) return toast.error("Enter pickup and destination");

    setLoading(true);

    try {
      await api.post("/rides/request", {
        fare_estimate: 120
      });

      toast.success("Driver assigned successfully!");
      setPickup("");
      setDrop("");
      fetchRides();

    } catch (error) {
      const message =
        error.response?.data?.detail || "Request failed. Please try again";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const activeRide = rides.find(
    (r) => r.status === "assigned" || r.status === "ongoing"
  );

  const pastRides = rides.filter(
    (r) => r.status === "completed" || r.status === "cancelled"
  );

  return (
    <div className="flex bg-[#F3F3F3] min-h-screen font-sans">
      <Sidebar role="rider" />

      <main className="ml-64 flex-1 relative">

        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-black tracking-tight">
            Request a Ride
          </h2>

          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              System Live
            </span>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

          {/* Booking Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow border border-gray-100">

              <h3 className="text-2xl font-black mb-6 text-black">
                Where to?
              </h3>

              <div className="space-y-4">

                <input
                  placeholder="Pickup Location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50"
                />

                <input
                  placeholder="Destination"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50"
                />

                <button
                  onClick={requestRide}
                  disabled={loading || activeRide}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold"
                >
                  {loading ? "Searching..." : "Confirm Ride"}
                </button>

              </div>
            </div>
          </div>

          {/* Ride History */}
          <div className="lg:col-span-8 space-y-8">

            {activeRide && (
              <div className="bg-black text-white p-6 rounded-2xl">
                <p className="text-sm text-gray-400">Active Ride</p>

                <p className="text-lg font-bold mt-2">
                  Fare: ₹{activeRide.fare_estimate}
                </p>

                <StatusBadge status={activeRide.status} />
              </div>
            )}

            <div className="space-y-3">

              {pastRides.length === 0 ? (
                <p className="text-gray-400">No previous rides</p>
              ) : (
                pastRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white p-6 rounded-xl flex justify-between"
                  >
                    <p>₹{ride.fare_estimate}</p>

                    <StatusBadge status={ride.status} />
                  </div>
                ))
              )}

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default RiderDashboard;