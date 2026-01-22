import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getLessonDetail,
  getModuleDetail,
  getCourseDetail,
  markLessonComplete,
  askai,
  generateQuiz,
} from "../services/apiClient";
import { jwtDecode } from "jwt-decode";
import RequestDoubtSession from "../components/common/RequestDoubtSession";


export default function Lesson() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [moduleLessons, setModuleLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [courseName, setCourseName] = useState("");
  const [moduleName, setModuleName] = useState("");

  // Ask AI state
  const [showAskAI, setShowAskAI] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  //Generate Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});

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

  // ---------- ASK AI ----------
  async function handleAskAI() {
    if (!aiQuestion.trim()) return;

    try {
      setAiLoading(true);
      setAiError("");
      setAiAnswer("");

      const res = await askai({
        lesson_id: lessonId,
        question: aiQuestion,
      });

      setAiAnswer(res.answer);
      setAiQuestion("");
    } catch (err) {
      console.error(err);
      setAiError("Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  }

  //-----------Generate Quiz------------
  async function handleGenerateQuiz() {
    try {
      setQuizLoading(true);
      setQuiz(null);
      setSelectedAnswers({});

      const res = await generateQuiz({
        lesson_id: lessonId,
        difficulty,
      });

      setQuiz(res.questions); // assuming { questions: [] }
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz");
    } finally {
      setQuizLoading(false);
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

  if (loading) return <p className="text-center mt-5">Loading lesson...</p>;
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;
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
                    className={`list-group-item ${
                      isActive ? "bg-primary text-white" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}/modules/${moduleId}/lessons/${l.id}`
                      )
                    }
                  >
                    {index + 1}. {l.lesson_name}
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

          <h2 className="fw-bold mb-2">{lesson.lesson_name}</h2>

          {/* VIDEO */}
          {lesson.video_url && (
            <div className="ratio ratio-16x9 mb-4">
              <iframe src={getEmbedUrl(lesson.video_url)} title="Lesson video" allowFullScreen />
            </div>
          )}

          {/* CONTENT */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <p style={{ whiteSpace: "pre-line" }}>
                {lesson.content || "No written content for this lesson."}
              </p>

              {decoded.user_role === "student" && (
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-success" onClick={handleComplete}>
                    Mark as Completed
                  </button>

                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowAskAI(prev => !prev)}
                  >
                    Ask AI
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowQuiz(prev => !prev)}
                  >
                    Generate Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

          {showQuiz && (
            <div className="card shadow-sm mb-4 border-secondary">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>AI Quiz</span>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setShowQuiz(false)}
                >
                  ✕
                </button>
              </div>

              <div className="card-body">
                {/* Difficulty */}
                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <button
                  className="btn btn-primary mb-3"
                  onClick={handleGenerateQuiz}
                  disabled={quizLoading}
                >
                  {quizLoading ? "Generating..." : "Generate Quiz"}
                </button>

                {/* QUIZ RENDER */}
                {quiz && quiz.map((q, index) => (
                  <div key={index} className="mb-4">
                    <p className="fw-bold">
                      {index + 1}. {q.question}
                    </p>

                    {q.options.map((opt, i) => {
                      const selected = selectedAnswers[index];
                      const isCorrect = opt === q.answer;
                      const isSelected = opt === selected;

                      let className = "form-check";

                      if (selected) {
                        if (isCorrect) className += " text-success";
                        if (isSelected && !isCorrect) className += " text-danger";
                      }

                      return (
                        <div className={className} key={i}>
                          <input
                            type="radio"
                            className="form-check-input"
                            name={`q-${index}`}
                            disabled={!!selected}
                            onChange={() =>
                              setSelectedAnswers(prev => ({
                                ...prev,
                                [index]: opt,
                              }))
                            }
                          />
                          <label className="form-check-label">
                            {opt}
                          </label>
                        </div>
                      );
                    })}

                    {/* Explanation */}
                    {selectedAnswers[index] &&
                      selectedAnswers[index] !== q.correct_answer && (
                        <div className="alert alert-info mt-2">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* ================= ASK AI ================= */}
          {showAskAI && (
            <div className="card shadow-sm mb-4 border-primary">
              <div className="card-header bg-primary text-white d-flex justify-content-between">
                <span>Ask AI</span>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setShowAskAI(false)}
                >
                  ✕
                </button>
              </div>

              <div className="card-body">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Ask something about this lesson..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                />

                <button
                  className="btn btn-primary"
                  onClick={handleAskAI}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </button>

                {aiError && <p className="text-danger mt-2">{aiError}</p>}

                {aiAnswer && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <strong>AI Answer:</strong>
                    <p style={{ whiteSpace: "pre-line" }} className="mb-0">
                      {aiAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= DOUBT ================= */}
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
