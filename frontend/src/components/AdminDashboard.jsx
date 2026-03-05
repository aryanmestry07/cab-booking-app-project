import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { removeToken } from "../utils/auth";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      removeToken();
      navigate("/login"); // ✅ Correct redirect
    } else {
      console.error(err);
      alert(err.response?.data?.detail || "Something went wrong ❌");
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/rides/analytics");
        setAnalytics(res.data);
      } catch (err) {
        handleAuthError(err);
      }
    };

    fetchAnalytics();
  }, []);

  const logout = () => {
    removeToken();
    navigate("/login"); // ✅ Correct redirect
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Admin Analytics Dashboard 📊
      </h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-xl mb-6 w-full"
      >
        Logout 🔐
      </button>

      {!analytics && (
        <p className="text-center">Loading analytics...</p>
      )}

      {analytics && (
        <div className="grid grid-cols-2 gap-4">

          <Card title="Total Rides" value={analytics.total_rides} />
          <Card title="Total Revenue" value={`₹${analytics.total_revenue}`} />
          <Card title="Completed Rides" value={analytics.completed_rides} />
          <Card title="Assigned Rides" value={analytics.assigned_rides} />
          <Card title="Ongoing Rides" value={analytics.ongoing_rides} />
          <Card title="Cancelled Rides" value={analytics.cancelled_rides} />

        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow">
      <h2 className="font-bold">{title}</h2>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}