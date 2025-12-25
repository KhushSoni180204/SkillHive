// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-4 fw-bold text-danger">404</h1>
      <p className="fs-4">Oops! Page not found.</p>
      <Link to="/" className="btn btn-primary mt-3">
          Go Back Home
      </Link>
    </div>
  );
}
