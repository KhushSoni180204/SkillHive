import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getLessonDetail,
  getModuleDetail,
  markLessonComplete,
} from "../services/apiClient";
import { jwtDecode } from "jwt-decode";


export default function Lesson() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  const decode = jwtDecode(token);

  // ---------- MARK COMPLETE ----------
  async function handleComplete() {
    try {
      await markLessonComplete(lessonId);
      alert("Lesson marked as completed");
    } catch {
      alert("Error marking lesson complete");
    }
  }

  // ---------- FETCH LESSON + MODULE ----------
  useEffect(() => {
    async function fetchData() {
      try {
        const lessonData = await getLessonDetail(lessonId);
        setLesson(lessonData);

        const moduleData = await getModuleDetail(moduleId);
        const lessons = moduleData.lessons || [];

        setModuleLessons(lessons);

        const index = lessons.findIndex(
          (l) => l.id === Number(lessonId)
        );
        setCurrentIndex(index);
      } catch (err) {
        console.error(err);
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lessonId, moduleId]);

  if (loading) {
    return <p className="text-center mt-5">Loading lesson...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  }

  if (!lesson) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < moduleLessons.length - 1;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav className="mb-3">
        <small>
          <Link to="/courses">Courses</Link> /{" "}
          <Link to={`/courses/${courseId}`}>Course</Link> /{" "}
          <Link to={`/courses/${courseId}/modules/${moduleId}`}>
            Module
          </Link>{" "}
          / <span className="text-muted">{lesson.lesson_name}</span>
        </small>
      </nav>

      {/* Lesson Title */}
      <h2 className="fw-bold mb-2">{lesson.lesson_name}</h2>

      {lesson.duration && (
        <p className="text-muted">Duration: {lesson.duration} min</p>
      )}

      {/* VIDEO SECTION */}
      {lesson.video_url && (
        <div className="ratio ratio-16x9 mb-4">
          <iframe
            src={lesson.video_url}
            title={lesson.lesson_name}
            allowFullScreen
          />
        </div>
      )}

      {!lesson.video_url && lesson.video_file && (
        <video
          controls
          className="w-100 mb-4"
          src={lesson.video_file}
        />
      )}

      {/* Content */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {lesson.content ? (
            <p style={{ whiteSpace: "pre-line" }}>{lesson.content}</p>
          ) : (
            <p className="text-muted">
              No written content for this lesson.
            </p>
          )}
          {decode.user_role === "student" ? (
            <button className="btn btn-success" onClick={handleComplete}>
              Mark as Completed
            </button>
          ):null}
        </div>
      </div>

      {/* Navigation */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          disabled={!hasPrev}
          onClick={() =>
            navigate(
              `/courses/${courseId}/modules/${moduleId}/lessons/${moduleLessons[currentIndex - 1].id}`
            )
          }
        >
          ← Previous
        </button>

        <button
          className="btn btn-primary"
          disabled={!hasNext}
          onClick={() =>
            navigate(
              `/courses/${courseId}/modules/${moduleId}/lessons/${moduleLessons[currentIndex + 1].id}`
            )
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
}
