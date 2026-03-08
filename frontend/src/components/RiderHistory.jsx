import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";

function RiderHistory() {
  const [rides, setRides] = useState([]);
  const [rated, setRated] = useState({});
  const [paid, setPaid] = useState({});

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/rides/my-rides");
        const history = res.data.filter(
          (r) => r.status === "completed" || r.status === "cancelled"
        );
        setRides(history);
      } catch {
        console.error("History loading failed");
      }
    };
    loadHistory();
  }, []);

  const submitRating = async (rideId, rating) => {
    try {
      await api.post("/ratings/rate", {
        ride_id: rideId,
        rating: rating,
        comment: ""
      });
      toast.success("Feedback received");
      setRated((prev) => ({ ...prev, [rideId]: true }));
    } catch {
      toast.error("Rating submission failed");
    }
  };

  const payRide = async (rideId) => {
    try {
      await api.post(`/payments/pay/${rideId}`);
      toast.success("Payment processed");
      setPaid((prev) => ({ ...prev, [rideId]: true }));
    } catch {
      toast.error("Transaction failed");
    }
  };

  return (
    <div className="flex bg-[#F6F6F6] min-h-screen text-[#1a1a1a] antialiased">
      <Sidebar role="rider" />

      <main className="ml-64 flex-1 p-12 max-w-5xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-medium tracking-tighter">Your Activity</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Review and manage your past trips and payments.
          </p>
        </header>

        {rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white border border-gray-100 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex justify-between items-start"
              >
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      ID: {ride.id.slice(-6)}
                    </span>
                    <StatusBadge status={ride.status} />
                  </div>

                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Fare</p>
                      <p className="text-2xl font-medium tracking-tight">₹{ride?.fare_estimate ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Distance</p>
                      <p className="text-sm font-medium">{ride?.distance ?? 0} km</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-8 items-center">
                    {ride.status === "completed" && !rated[ride.id] && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rate Driver</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => submitRating(ride.id, star)}
                              className="text-gray-200 hover:text-black text-xl transition-colors px-0.5"
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {rated[ride.id] && <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">★ Rated</span>}

                    {ride.status === "completed" && !paid[ride.id] && (
                      <button
                        onClick={() => payRide(ride.id)}
                        className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#333]"
                      >
                        Complete Payment
                      </button>
                    )}
                    {paid[ride.id] && <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">✓ Paid</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 font-medium italic">No ride history found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default RiderHistory;