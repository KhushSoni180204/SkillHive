import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCourseDetail, enrollInCourse } from "../services/apiClient";
import { jwtDecode } from "jwt-decode";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState(null);

  // ---------- INIT AUTH ----------
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.user_role);
    }
  }, []);

  // ---------- AUTH GUARD ----------
  function requireAuth() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/auth/login");
      return false;
    }
    return true;
  }

  // ---------- ENROLL ----------
  async function handleEnroll() {
    if (!requireAuth()) return;

    try {
      setEnrolling(true);
      await enrollInCourse(course.id);
      setMessage("Successfully enrolled!");
    } catch (err) {
      if (err.response?.status === 403) {
        setMessage("You are already enrolled in this course");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  }


  // ---------- FETCH COURSE ----------
  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getCourseDetail(courseId);
        setCourse(data);
      } catch {
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  // ---------- STATES ----------
  if (loading) return <p className="text-center mt-5">Loading course...</p>;
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;
  if (!course) return null;

  return (
    <div className="container py-5">
      <Link to="/courses" className="btn btn-light mb-3">
        ← Back to Courses
      </Link>

      <h2 className="fw-bold">{course.course_name}</h2>
      <p className="text-muted">{course.description}</p>

      {/* ENROLL BUTTON (students only) */}
      {userRole === "student" && (
        <>
          <button
            className="btn btn-success mb-4"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? "Enrolling..." : "Enroll in Course"}
          </button>

          {message && <p className="mt-2">{message}</p>}
        </>
      )}

      {/* MODULES */}
      <h4 className="mt-4 mb-3">Modules</h4>

      {course.modules?.length === 0 ? (
        <p className="text-muted">No modules available yet.</p>
      ) : (
        <div className="list-group">
          {course.modules.map((module) => (
            <div
              key={module.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 className="mb-1 fw-bold">
                  {module.module_order}. {module.module_name}
                </h6>
                <small className="text-muted">
                  {module.lessons.length} lessons
                </small>
              </div>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  if (!requireAuth()) return;
                  navigate(`/courses/${course.id}/modules/${module.id}`);
                }}
              >
                View Module
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
