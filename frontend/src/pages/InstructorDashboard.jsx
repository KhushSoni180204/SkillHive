import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  getInstructorAnalytics
} from "../services/apiClient";

export default function InstructorDashboard() {
  // ---------------- COURSES ----------------
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ---------------- EDIT ----------------
  const [editingCourse, setEditingCourse] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------------- DELETE ----------------
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------- ANALYTICS ----------------
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ---------- FETCH COURSES ----------
  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getInstructorCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // ---------- FETCH ANALYTICS ----------
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await getInstructorAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyticsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // ---------- CREATE COURSE ----------
  async function handleCreateCourse(e) {
    e.preventDefault();

    try {
      const newCourse = await createCourse({
        course_name: courseName,
        description,
        status: "draft",
      });

      setCourses((prev) => [newCourse, ...prev]);
      setCourseName("");
      setDescription("");
    } catch {
      alert("You are not allowed to create courses");
    }
  }

  // ---------- TOGGLE STATUS ----------
  async function handleToggle(course) {
    const newStatus = course.status === "draft" ? "published" : "draft";

    try {
      setUpdatingId(course.id);
      await updateCourse(course.id, { status: newStatus });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, status: newStatus } : c
        )
      );
    } catch {
      alert("Failed to update course status");
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------- EDIT ----------
  function openEditModal(course) {
    setEditingCourse(course);
    setEditName(course.course_name);
    setEditDescription(course.description);
  }

  async function handleSaveEdit() {
    if (!editingCourse) return;

    try {
      setSaving(true);

      const res = await updateCourse(editingCourse.id, {
        course_name: editName,
        description: editDescription,
      });

      const updated = res.data ?? res;

      // Update courses
      setCourses((prev) =>
        prev.map((c) =>
          c.id === updated.id ? updated : c
        )
      );

      // Keep analytics in sync
      setAnalytics((prev) =>
        prev.map((a) =>
          a.course_id === updated.id
            ? { ...a, course_name: updated.course_name }
            : a
        )
      );

      setEditingCourse(null);
    } catch {
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  }

  // ---------- DELETE ----------
  async function handleDeleteCourse() {
    if (!deletingCourse) return;

    try {
      setDeleting(true);
      await deleteCourse(deletingCourse.id);

      setCourses((prev) =>
        prev.filter((c) => c.id !== deletingCourse.id)
      );

      // Remove analytics entry
      setAnalytics((prev) =>
        prev.filter((a) => a.course_id !== deletingCourse.id)
      );

      setDeletingCourse(null);
    } catch {
      alert("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-center mt-5">Loading instructor dashboard...</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Instructor Dashboard</h2>

      {/* CREATE COURSE */}
      <div className="card mb-5 shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Create New Course</h5>

          <form onSubmit={handleCreateCourse}>
            <div className="mb-3">
              <label className="form-label">Course Name</label>
              <input
                className="form-control"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary">Create Course</button>
          </form>
        </div>
      </div>

      {/* MY COURSES */}
      <h4 className="fw-bold mb-3">My Courses</h4>

      <div className="list-group mb-5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <strong>{course.course_name}</strong>

            <div className="d-flex align-items-center gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={course.status === "published"}
                  disabled={updatingId === course.id}
                  onChange={() => handleToggle(course)}
                />
              </div>

              <span
                className={`badge ${
                  course.status === "published"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {course.status}
              </span>

              <Link
                to={`/dashboard/instructor/course/${course.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                Manage
              </Link>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => openEditModal(course)}
              >
                Edit
              </button>

              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setDeletingCourse(course)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingCourse && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Edit Course</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditingCourse(null)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Course Name</label>
                  <input
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => setEditingCourse(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={handleSaveEdit}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {deletingCourse && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Course</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeletingCourse(null)}
                />
              </div>

              <div className="modal-body">
                <p>
                  Are you sure you want to delete
                  <strong> {deletingCourse.course_name}</strong>?
                </p>
                <p className="text-muted mb-0">
                  This action cannot be undone.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={deleting}
                  onClick={() => setDeletingCourse(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleDeleteCourse}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      <h4 className="fw-bold mb-3">Course Analytics</h4>

      {analyticsLoading ? (
        <p>Loading analytics...</p>
      ) : analytics.length === 0 ? (
        <p className="text-muted">No analytics available yet.</p>
      ) : (
        analytics.map((a) => (
          <div key={a.course_id} className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">{a.course_name}</h5>

              <div className="row mb-3">
                <div className="col">
                  <small>Enrollments</small>
                  <h4>{a.total_enrollments}</h4>
                </div>
                <div className="col">
                  <small>Completed</small>
                  <h4>{a.completed_students}</h4>
                </div>
                <div className="col">
                  <small>Completion Rate</small>
                  <h4>{a.completion_rate}%</h4>
                </div>
              </div>

              <div>
                <small>Average Progress</small>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${a.average_progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
