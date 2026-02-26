import { useState } from "react";
import axios from "axios";

export default function DriverDashboard() {
  const [driverId, setDriverId] = useState("");
  const [available, setAvailable] = useState(true);

  const toggleAvailability = async () => {
    if (!driverId) {
      alert("Enter Driver ID ⚠️");
      return;
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/drivers/${driverId}/availability`,
        null,
        {
          params: { is_available: !available },
        }
      );

      setAvailable(!available);
    } catch (err) {
      console.error(err);
      alert("Failed to update ❌");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard 🚗</h1>

      <input
        type="text"
        placeholder="Enter Driver ID"
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        className="border p-2 rounded-xl w-full mb-3"
      />

      <button
        onClick={toggleAvailability}
        className="bg-black text-white px-4 py-2 rounded-xl w-full"
      >
        Set {available ? "Offline 🔴" : "Online 🟢"}
      </button>

      <p className="mt-4">
        Current Status:
        <span className="font-bold ml-2">
          {available ? "Available 🟢" : "Unavailable 🔴"}
        </span>
      </p>
    </div>
  );
}