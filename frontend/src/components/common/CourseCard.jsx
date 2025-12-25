import { Link } from "react-router-dom";

export default function CourseCard({ id, title, description }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">

        <div className="card-body">
          <h5 className="card-title fw-bold">{title}</h5>
          <p className="card-text text-muted">{description}</p>

          <Link className="btn btn-primary w-100 mt-3" to={`/courses/${id}`}>
            View Course
          </Link>
        </div>

      </div>
    </div>
  );
}
