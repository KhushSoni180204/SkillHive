// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      <div className="text-center">

        <h1 className="fw-bold mb-3">
          Welcome to <span className="text-primary">SkillHive</span>
        </h1>

        <p className="text-muted fs-5 mb-4">
          Your simple and clean learning platform. Start exploring courses at your own pace.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link className="btn btn-primary btn-lg" to="/courses">
            Explore Courses
          </Link>
        </div>

      </div>
    </div>
  );
}
