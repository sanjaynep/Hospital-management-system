import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("access_token");
  const role  = localStorage.getItem("role");

  // treat explicit string values that represent missing tokens as unauthenticated
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  
  if (requiredRole && role !== requiredRole) {
    if (role === "doctor") return <Navigate to="/Doctor-profile" replace />;
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProtectedRoute;