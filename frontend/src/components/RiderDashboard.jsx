import { useState } from "react";
import axios from "axios";

export default function RiderDashboard() {
  const [riderId, setRiderId] = useState("");
  const [fare, setFare] = useState("");
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookRide = async () => {
    if (!riderId || !fare) {
      alert("Enter Rider ID & Fare ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/rides/request",
        {
          rider_id: riderId,
          fare_estimate: parseFloat(fare),
        }
      );

      setRide(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Ride booking failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/rides/accept/${ride.ride_id}`
      );

      setRide(res.data);
    } catch (err) {
      console.error(err);
      alert("Accept failed ❌");
    }
  };

  const completeRide = async () => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/rides/complete/${ride.ride_id}`
      );

      setRide(res.data);
    } catch (err) {
      console.error(err);
      alert("Completion failed ❌");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rider Dashboard 🚖</h1>

      <input
        type="text"
        placeholder="Enter Rider ID"
        value={riderId}
        onChange={(e) => setRiderId(e.target.value)}
        className="border p-2 rounded-xl w-full mb-3"
      />

      <input
        type="number"
        placeholder="Enter Fare"
        value={fare}
        onChange={(e) => setFare(e.target.value)}
        className="border p-2 rounded-xl w-full mb-3"
      />

      <button
        onClick={bookRide}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-xl w-full"
      >
        {loading ? "Booking..." : "Book Ride 🚀"}
      </button>

      {ride && (
        <div className="mt-6 p-4 border rounded-xl bg-gray-50">
          <p><strong>Ride ID:</strong> {ride.ride_id}</p>
          <p><strong>Status:</strong> {ride.status}</p>

          {ride.driver_assigned && (
            <p><strong>Driver:</strong> {ride.driver_assigned} 🚗</p>
          )}

          <div className="flex gap-2 mt-4">
            {ride.status === "assigned" && (
              <button
                onClick={acceptRide}
                className="bg-green-600 text-white px-3 py-1 rounded-xl"
              >
                Accept Ride ✅
              </button>
            )}

            {ride.status === "ongoing" && (
              <button
                onClick={completeRide}
                className="bg-blue-600 text-white px-3 py-1 rounded-xl"
              >
                Complete Ride 🏁
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}