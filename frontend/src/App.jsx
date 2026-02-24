import { useState } from "react";
import RiderDashboard from "./components/RiderDashboard";
import DriverDashboard from "./components/DriverDashboard";
import "./index.css";

function App() {
  const [view, setView] = useState("rider");

  return (
    <div>
      <div className="flex gap-4 p-4 bg-gray-100">
        <button onClick={() => setView("rider")}>Rider 🚖</button>
        <button onClick={() => setView("driver")}>Driver 🚗</button>
      </div>

      {view === "rider" ? <RiderDashboard /> : <DriverDashboard />}
    </div>
  );
}

export default App;