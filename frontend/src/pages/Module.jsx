import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getModuleProgress } from "../services/apiClient"; 

export default function Module() {
  const { courseId, moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchModule() {
      try {
        const data = await getModuleProgress(moduleId);
        setModule(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load module progress");
      } finally {
        setLoading(false);
      }
    }

    fetchModule();
  }, [moduleId]);


  if (loading) {
    return <p className="text-center mt-5">Loading module...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  }

  return (
    <div className="container py-5">
      {/* Back */}
      <Link to={`/courses/${courseId}`} className="btn btn-light mb-3">
        ← Back to Course
      </Link>

      {/* Module Info */}
      <h2 className="fw-bold">
        {module.module_order}. {module.module_name}
      </h2>

      {module.summary && (
        <p className="text-muted">{module.summary}</p>
      )}

      {/* Lessons */}
      <h4 className="mt-4 mb-3">Lessons</h4>

      {module.lessons.length === 0 ? (
        <p className="text-muted">No lessons available yet.</p>
      ) : (
        <div className="list-group">
          {module.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 className="mb-1 fw-bold">
                  {index + 1}. {lesson.lesson_name}
                </h6>

                {lesson.duration && (
                  <small className="text-muted">
                    Duration: {lesson.duration} min
                  </small>
                )}
              </div>

              {lesson.completed ? (
                <>
                  <span className="badge bg-success">✓ Completed</span>
                  <Link
                    to={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View
                  </Link>
                </>
              ) : (
                <Link
                  to={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Start
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
