import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";

function DriverHistory() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/rides/my-rides");
        const history = res.data.filter((r) => r.status === "completed");
        setRides(history);
      } catch {
        console.error("Failed to load driver history");
      }
    };
    loadHistory();
  }, []);

  const totalEarnings = rides.reduce(
    (sum, ride) => sum + (ride.fare_estimate || 0),
    0
  );

  return (
    <div className="flex bg-[#0a0a0a] min-h-screen text-white antialiased">
      <Sidebar role="driver" />

      <main className="ml-64 flex-1 p-12 max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-medium tracking-tighter">Earnings History</h2>
            <p className="text-gray-500 mt-2 text-sm uppercase tracking-[0.2em] font-bold">
              Driver Partner Portal
            </p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Balance</p>
             <p className="text-4xl font-medium tracking-tighter text-emerald-500">₹{totalEarnings}</p>
          </div>
        </header>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-8 mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Total Trips</p>
            <p className="text-xl font-medium">{rides.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Avg. Per Trip</p>
            <p className="text-xl font-medium">₹{rides.length > 0 ? (totalEarnings / rides.length).toFixed(0) : 0}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Service Tier</p>
            <p className="text-xl font-medium">Partner</p>
          </div>
        </div>

        {/* Ride List */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-600 mb-6">Recent Activity</h3>
          
          {rides.length > 0 ? (
            rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-[#111] border border-white/5 p-6 flex justify-between items-center group hover:bg-[#161616] transition-colors"
              >
                <div className="flex gap-12 items-center">
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-sm">
                    <span className="text-gray-400 text-xs font-bold">Trip</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Net Fare</p>
                    <p className="text-xl font-medium tracking-tight text-white">₹{ride?.fare_estimate ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Distance</p>
                    <p className="text-sm font-medium text-gray-300">{ride?.distance ?? 0} km</p>
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={ride.status} />
                  <p className="text-[10px] text-gray-600 mt-2 font-mono">#{ride.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-sm">
              <p className="text-gray-600 font-medium italic">No trip data available for this period.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DriverHistory;