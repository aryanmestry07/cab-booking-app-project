import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./components/Login";
import Signup from "./components/Signup";
import RiderDashboard from "./components/RiderDashboard";
import DriverDashboard from "./components/DriverDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      {/* Updated the main wrapper to bg-white to match the Uber/Ola aesthetic.
          Using selection:bg-black/10 for a subtle, high-end interaction feel.
      */}
      <div className="min-h-screen bg-white selection:bg-black/10 text-slate-900">
        
        {/* Light Theme Toaster:
            Standardizing notifications with white backgrounds and sharp borders 
            to match the professional light UI.
        */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#ffffff', 
              color: '#000000',
              border: '1px solid #e5e7eb', // gray-200
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#000000', // Black icon for a minimalist look
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Rider Routes */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute role="rider">
                <RiderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Driver Routes */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Redirect / Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;