import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../services/apiClient";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading analytics...</p>;

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Admin Analytics</h2>

      {/* USERS */}
      <div className="row mb-4">
        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Total Users</h6>
              <h3>{data.users.total}</h3>
              <small>
                Students: {data.users.students} | Instructors: {data.users.instructors}
              </small>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Total Enrollments</h6>
              <h3>{data.enrollments}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* COURSES */}
      <div className="row mb-4">
        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Courses</h6>
              <p className="mb-1">Total: {data.courses.total}</p>
              <p className="mb-1">Published: {data.courses.published}</p>
              <p className="mb-0">Draft: {data.courses.draft}</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6>Average Completion</h6>
              <h3>{data.completion_rate}%</h3>
              <div className="progress">
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${data.completion_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP COURSES */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Top Courses</h5>
          <p>
            <strong>Most Enrolled:</strong>{" "}
            {data.most_enrolled_course?.course__course_name || "—"}
          </p>
          <p className="mb-0">
            <strong>Least Enrolled:</strong>{" "}
            {data.least_enrolled_course?.course__course_name || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
