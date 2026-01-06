import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getLessonDetail,
  getModuleDetail,
  getCourseDetail,
  markLessonComplete,
} from "../services/apiClient";
import { jwtDecode } from "jwt-decode";
import RequestDoubtSession from "../components/common/RequestDoubtSession";
import MyDoubtSessions from "../components/common/MyDoubtSessions";


export default function Lesson() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [courseName, setCourseName] = useState("");
  const [moduleName, setModuleName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");
  const decoded = jwtDecode(token);

  // ---------- VIDEO EMBED ----------
  function getEmbedUrl(url) {
    if (!url) return null;

    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
  }

  // ---------- MARK COMPLETE ----------
  async function handleComplete() {
    try {
      await markLessonComplete(lessonId);
      alert("Lesson marked as completed");
    } catch {
      alert("Error marking lesson complete");
    }
  }

  // ---------- FETCH DATA ----------
  useEffect(() => {
    async function fetchData() {
      try {
        const lessonData = await getLessonDetail(lessonId);
        setLesson(lessonData);
        
        const moduleData = await getModuleDetail(moduleId);
        const lessons = moduleData.lessons || [];

        setModuleLessons(lessons);
        setModuleName(moduleData.module_name);

        const courseData = await getCourseDetail(courseId);
        setCourseName(courseData.course_name);

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
    <div className="container-fluid py-4">
      <div className="row">

        {/* ================= SIDEBAR ================= */}
        <div className="col-md-3 border-end vh-100 overflow-auto">
          <div className="p-3">
            <h6 className="fw-bold mb-2">Module Lessons</h6>

            <p className="text-muted small">
              {currentIndex + 1} / {moduleLessons.length} lessons
            </p>

            <ul className="list-group list-group-flush">
              {moduleLessons.map((l, index) => {
                const isActive = l.id === Number(lessonId);

                return (
                  <li
                    key={l.id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      isActive ? "bg-primary text-white" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}/modules/${moduleId}/lessons/${l.id}`
                      )
                    }
                  >
                    <span>
                      {index + 1}. {l.lesson_name}
                    </span>

                    {isActive && (
                      <span className="badge bg-light text-dark">
                        Current
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="col-md-9 px-4">

          {/* Breadcrumb */}
          <nav className="mb-3">
            <small>
              <Link to="/courses">Courses</Link> /{" "}
              <Link to={`/courses/${courseId}`}>{courseName}</Link> /{" "}
              <Link to={`/courses/${courseId}/modules/${moduleId}`}>
                {moduleName}
              </Link>{" "}
              / <span className="text-muted">{lesson.lesson_name}</span>
            </small>
          </nav>

          {/* Lesson Title */}
          <h2 className="fw-bold mb-2">{lesson.lesson_name}</h2>

          {lesson.duration && (
            <p className="text-muted">Duration: {lesson.duration} min</p>
          )}

          {/* VIDEO */}
          {lesson.video_url && (
            <div className="ratio ratio-16x9 mb-4">
              <iframe
                src={getEmbedUrl(lesson.video_url)}
                title={lesson.lesson_name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

          {/* CONTENT */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              {lesson.content ? (
                <p style={{ whiteSpace: "pre-line" }}>{lesson.content}</p>
              ) : (
                <p className="text-muted">
                  No written content for this lesson.
                </p>
              )}

              {decoded.user_role === "student" && (
                <button
                  className="btn btn-success mt-2"
                  onClick={handleComplete}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
          
          {/* ================= DOUBT SESSIONS ================= */}
          {decoded.user_role === "student" && (
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Have a doubt?</h5>
                <RequestDoubtSession courseId={courseId} />
              </div>
            </div>
          )}

          {/* NAVIGATION */}
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
      </div>
    </div>
  );
}
