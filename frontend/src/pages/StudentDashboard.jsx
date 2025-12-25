import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEnrollments, getLessonProgress } from "../services/apiClient";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [enrollmentsData, progressData] = await Promise.all([
          getEnrollments(),
          getLessonProgress(),
        ]);

        setEnrollments(enrollmentsData);
        setLessonProgress(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function isLessonCompleted(lessonId) {
    return lessonProgress.some(
      (p) => p.lesson === lessonId && p.completed
    );
  }

  function calculateProgress(course) {
    let total = 0;
    let completed = 0;

    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        total += 1;
        if (isLessonCompleted(lesson.id)) {
          completed += 1;
        }
      });
    });

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  if (loading) {
    return <p className="text-center mt-5">Loading dashboard...</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Student Dashboard</h2>

      {enrollments.length === 0 ? (
        <div className="alert alert-info">
          You are not enrolled in any courses yet.
        </div>
      ) : (
        enrollments.map((enroll) => {
          const progress = calculateProgress(enroll.course);

          return (
            <div key={enroll.id} className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="fw-semibold mb-0">
                    {enroll.course.course_name}
                  </h4>
                  <span className="badge bg-success">Enrolled</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Progress</small>
                    <small className="fw-bold">{progress}%</small>
                  </div>

                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar ${
                        progress === 100 ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Modules */}
                <div className="list-group">
                  {enroll.course.modules.map((module) => (
                    <div
                      key={module.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>
                          {module.module_order}. {module.module_name}
                        </strong>
                        <div className="text-muted small">
                          {module.lessons.length} lessons
                        </div>
                      </div>

                      <Link
                        to={`/courses/${enroll.course.id}/modules/${module.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
