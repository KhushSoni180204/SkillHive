import { useEffect, useState } from "react";
import {
  getAllCourses,
  getAllUsers,
  toggleCourseStatusAdmin,
  deleteUser,
  deleteAdminCourse,
  toggleUserStatus,
} from "../services/apiClient";

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Merge users only for instructor lookup
  const allUsers = [...students, ...instructors];

  // ---------- FETCH DATA ----------
  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesData, usersData] = await Promise.all([
          getAllCourses(),
          getAllUsers(),
        ]);

        setCourses(coursesData);
        setStudents(usersData.students || []);
        setInstructors(usersData.instructors || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ---------- TOGGLE COURSE ----------
  async function handleToggle(course) {
    try {
      setUpdatingId(course.id);
      const res = await toggleCourseStatusAdmin(course.id);

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, status: res.status } : c
        )
      );
    } catch {
      alert("Failed to update course status");
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------- DELETE COURSE ----------
  async function handleDeleteCourse(courseId) {
    if (!window.confirm("Delete this course permanently?")) return;

    try {
      await deleteAdminCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      alert("Failed to delete course");
    }
  }

  // ---------- TOGGLE USER ----------
  async function handleToggleUser(targetUser) {
    try {
      const updated = await toggleUserStatus(targetUser.id);

      setStudents((prev) =>
        prev.map((u) =>
          u.id === updated.id ? { ...u, is_active: updated.is_active } : u
        )
      );

      setInstructors((prev) =>
        prev.map((u) =>
          u.id === updated.id ? { ...u, is_active: updated.is_active } : u
        )
      );
    } catch {
      alert("Failed to update user status");
    }
  }

  // ---------- DELETE USER ----------
  async function handleDeleteUser() {
    if (!deletingUser) return;

    try {
      setDeleting(true);
      await deleteUser(deletingUser.id);

      setStudents((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setInstructors((prev) => prev.filter((u) => u.id !== deletingUser.id));

      setDeletingUser(null);
    } catch {
      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-center mt-5">Loading admin dashboard...</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>

      {/* COURSES */}
      <h4 className="fw-bold mb-3">All Courses</h4>
      <div className="list-group mb-5">
        {courses.map((course) => {
          const instructor = allUsers.find(
            (u) => u.id === course.instructor
          );

          return (
            <div
              key={course.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{course.course_name}</strong>
                <div className="text-muted small">
                  Instructor: {instructor ? instructor.username : "—"}
                </div>
              </div>

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

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STUDENTS */}
      <h4 className="fw-bold mb-3">Students</h4>
      <div className="list-group mb-5">
        {students.length === 0 ? (
          <p className="text-muted">No students found.</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {/* LEFT */}
              <div>
                <strong>{student.username}</strong>
                <div className="text-muted small">Role: Student</div>
              </div>

              {/* RIGHT */}
              <div className="d-flex align-items-center gap-3">
                <button
                  className={`btn btn-sm ${
                    student.is_active
                      ? "btn-outline-warning"
                      : "btn-outline-success"
                  }`}
                  onClick={() => handleToggleUser(student)}
                >
                  {student.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setDeletingUser(student)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


      {/* INSTRUCTORS */}
      <h4 className="fw-bold mb-3">Instructors</h4>
      <div className="list-group">
        {instructors.length === 0 ? (
          <p className="text-muted">No instructors found.</p>
        ) : (
          instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {/* LEFT */}
              <div>
                <strong>{instructor.username}</strong>
                <div className="text-muted small">Role: Instructor</div>
              </div>

              {/* RIGHT */}
              <div className="d-flex align-items-center gap-3">
                <button
                  className={`btn btn-sm ${
                    instructor.is_active
                      ? "btn-outline-warning"
                      : "btn-outline-success"
                  }`}
                  onClick={() => handleToggleUser(instructor)}
                >
                  {instructor.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setDeletingUser(instructor)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


      {/* DELETE USER MODAL */}
      {deletingUser && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete User</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeletingUser(null)}
                />
              </div>

              <div className="modal-body">
                <p>
                  Delete user <strong>{deletingUser.username}</strong>?
                </p>
                <p className="text-muted mb-0">
                  This action cannot be undone.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  disabled={deleting}
                  onClick={() => setDeletingUser(null)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleDeleteUser}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
