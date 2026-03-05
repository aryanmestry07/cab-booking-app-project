import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getToken();
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}