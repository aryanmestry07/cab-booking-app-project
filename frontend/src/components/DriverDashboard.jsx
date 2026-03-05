import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

function DriverDashboard() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch rides (available + my rides)
  const fetchAvailableRides = useCallback(async () => {
    try {

      const availableRes = await api.get("/rides/available");
      const myRidesRes = await api.get("/rides/my-rides");

      const allRides = [
        ...availableRes.data,
        ...myRidesRes.data
      ];

      setRides(allRides);

    } catch (err) {
      const msg =
        err.response?.data?.detail || "Could not refresh ride list";

      toast.error(msg);
      console.error("Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchAvailableRides();

    const interval = setInterval(fetchAvailableRides, 10000);
    return () => clearInterval(interval);
  }, [fetchAvailableRides]);

  // Accept / Complete Ride
  const handleAction = async (rideId, action) => {
    setLoading(true);

    try {

      await api.post(`/rides/${action}/${rideId}`);

      const successMsg =
        action === "accept"
          ? "Ride Accepted! Navigate to pickup."
          : "Ride Completed! Fare added.";

      toast.success(successMsg);

      fetchAvailableRides();

    } catch (err) {

      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        `Failed to ${action} ride`;

      toast.error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  // Ride filters
  const availableRides = rides.filter((r) => r.status === "assigned");
  const activeRides = rides.filter((r) => r.status === "ongoing");
  const completedRides = rides.filter((r) => r.status === "completed");

  const totalEarnings = completedRides.reduce(
    (sum, ride) => sum + (ride.fare_estimate || 0),
    0
  );

  return (
    <div className="flex bg-gray-950 min-h-screen text-slate-200">
      <Sidebar role="driver" />

      <div className="ml-64 w-full p-8 relative">

        {loading && (
          <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-bounce">
              Processing Request...
            </div>
          </div>
        )}

        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold text-white">
              Driver Console
            </h2>
            <p className="text-slate-400">
              View available rides and track your progress
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-right min-w-[180px]">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
              Today's Earnings
            </p>
            <p className="text-3xl font-black text-emerald-400">
              ₹{totalEarnings}
            </p>
          </div>
        </header>

        <div className="space-y-10">

          {/* Active Ride */}
          {activeRides.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Ongoing Trip
              </h3>

              {activeRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-gray-900 border-2 border-blue-500/30 p-6 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <p className="text-xl font-bold text-white">
                      Rider ID: {ride.rider_id}
                    </p>

                    <StatusBadge status={ride.status} />
                  </div>

                  <button
                    disabled={loading}
                    onClick={() => handleAction(ride.id, "complete")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Complete Ride
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* Available Rides */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Available Requests
              </h3>

              <button
                onClick={fetchAvailableRides}
                className="text-xs text-blue-500 hover:underline font-bold"
              >
                REFRESH
              </button>
            </div>

            {availableRides.length === 0 ? (
              <div className="bg-gray-900/50 border border-dashed border-gray-800 p-16 rounded-2xl text-center">
                <p className="text-gray-500 text-lg">
                  Searching for nearby riders...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {availableRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-gray-900 border border-gray-800 p-6 rounded-2xl"
                  >

                    <p className="text-white font-semibold text-lg">
                      Rider ID: {ride.rider_id}
                    </p>

                    <p className="text-emerald-400 font-bold text-xl mt-2">
                      ₹{ride.fare_estimate}
                    </p>

                    <button
                      disabled={loading}
                      onClick={() => handleAction(ride.id, "accept")}
                      className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4 hover:bg-blue-500 hover:text-white"
                    >
                      ACCEPT REQUEST
                    </button>

                  </div>
                ))}

              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;