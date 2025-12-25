// src/pages/Landing.jsx
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="container py-5">
      <div className="row align-items-center">
        
        {/* Left section */}
        <div className="col-md-6">
          <h1 className="fw-bold mb-3">
            Welcome to <span className="text-primary">MyLMS</span>
          </h1>
          <p className="text-muted fs-5">
            A modern, clean, and powerful learning platform built for students
            and instructors. Learn, grow, and track your progress — all in one place.
          </p>

          <div className="mt-4">
            <Link to="/courses" className="btn btn-primary btn-lg me-3">
              Browse Courses
            </Link>
            <Link to="/auth/login" className="btn btn-outline-secondary btn-lg">
              Login
            </Link>
          </div>
        </div>

        {/* Right section */}
        <div className="col-md-6 text-center mt-4 mt-md-0">
          <img
            src="https://via.placeholder.com/500x300"
            className="img-fluid rounded shadow"
            alt="LMS Illustration"
          />
        </div>
      </div>
    </div>
  );
}
