import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - Wrapper component that checks for authentication
 * Redirects to login if no token is found
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login while preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
