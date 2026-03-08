import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* Leaflet CSS (Required for maps) */
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import DriverLogin from "./components/DriverLogin";
import DriverSignup from "./components/DriverSignup";

import RiderDashboard from "./components/RiderDashboard";
import DriverDashboard from "./components/DriverDashboard";

import RiderHistory from "./components/RiderHistory";
import DriverHistory from "./components/DriverHistory";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white selection:bg-black/10 text-slate-900">

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#000000",
                secondary: "#ffffff",
              },
            },
          }}
        />

        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Driver Auth */}
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver-signup" element={<DriverSignup />} />

          {/* Rider Dashboard */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute role="rider">
                <RiderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rider History */}
          <Route
            path="/rider/history"
            element={
              <ProtectedRoute role="rider">
                <RiderHistory />
              </ProtectedRoute>
            }
          />

          {/* Driver Dashboard */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Driver History */}
          <Route
            path="/driver/history"
            element={
              <ProtectedRoute role="driver">
                <DriverHistory />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Login />} />

        </Routes>

      </div>
    </Router>
  );
}

export default App;