import { useState } from "react";
import axios from "axios";

export default function RiderDashboard() {
  const [ride, setRide] = useState(null);

  const bookRide = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/rides/request", {
        rider_id: "aryan",
        pickup: [72.8777, 19.0760],
        drop: [72.8850, 19.0900],
      });

      setRide(res.data);
    } catch (err) {
      console.error(err);
      alert("Ride booking failed ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Rider Dashboard 🚖</h1>

      <button
        onClick={bookRide}
        className="mt-4 bg-black text-white px-4 py-2 rounded-xl"
      >
        Book Ride
      </button>

      {ride && (
        <div className="mt-4 p-4 border rounded-xl">
          <p>Ride ID: {ride.ride_id}</p>
          <p>Status: {ride.status}</p>
        </div>
      )}
    </div>
  );
}