import { useState } from "react";
import axios from "axios";

export default function DriverDashboard() {
  const [driverId, setDriverId] = useState("");
  const [available, setAvailable] = useState(true);

  const toggleAvailability = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/drivers/${driverId}/availability?is_available=${!available}`
      );

      setAvailable(!available);
    } catch (err) {
      console.error(err);
      alert("Failed to update availability ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Driver Dashboard 🚗</h1>

      <input
        type="text"
        placeholder="Enter Driver ID"
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        className="border p-2 rounded-xl mt-4 w-full"
      />

      <button
        onClick={toggleAvailability}
        className="mt-4 bg-black text-white px-4 py-2 rounded-xl"
      >
        Set {available ? "Offline 🔴" : "Online 🟢"}
      </button>

      <p className="mt-4">
        Current Status:{" "}
        <span className="font-bold">
          {available ? "Available 🟢" : "Unavailable 🔴"}
        </span>
      </p>
    </div>
  );
}