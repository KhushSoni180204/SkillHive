import { Link } from "react-router-dom";

export default function CourseCard({ id, title, description }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">
        
        {/* FLEX COLUMN */}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold">{title}</h5>

          {/* CONTENT AREA */}
          <p className="card-text text-muted flex-grow-1">
            {description}
          </p>

          {/* BUTTON STAYS AT BOTTOM */}
          <Link
            className="btn btn-primary w-100 mt-auto"
            to={`/courses/${id}`}
          >
            View Course
          </Link>
        </div>

      </div>
    </div>
  );
}
