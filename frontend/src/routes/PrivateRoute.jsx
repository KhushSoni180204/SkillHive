import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("access_token");

  // No token → login
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  let decoded;

  try {
    decoded = jwtDecode(token);
  } catch (err) {
    // Corrupted token → force logout
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return <Navigate to="/auth/login" replace />;
  }

  // Token expired → force logout
  const currentTime = Date.now() / 1000;
  if (decoded.exp && decoded.exp < currentTime) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return <Navigate to="/auth/login" replace />;
  }

  // Role-based access check
  if (role && decoded.user_role !== role) {
    return <Navigate to="/" replace />;
  }

  // Access granted
  return children;
}
