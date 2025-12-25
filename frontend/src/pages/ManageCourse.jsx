import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCourseDetail,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../services/apiClient";

export default function ManageCourse() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // MODULE STATE
  const [moduleName, setModuleName] = useState("");
  const [summary, setSummary] = useState("");
  const [editingModule, setEditingModule] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // LESSON STATE
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [lessonName, setLessonName] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");

  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonName, setEditLessonName] = useState("");
  const [editLessonContent, setEditLessonContent] = useState("");
  const [editLessonDuration, setEditLessonDuration] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  // ---------- FETCH COURSE ----------
  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getCourseDetail(courseId);
        setCourse({
          ...data,
          modules: (data.modules || []).map((m) => ({
            ...m,
            lessons: m.lessons || [],
          })),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  // ---------- ADD MODULE ----------
  async function handleAddModule(e) {
    e.preventDefault();

    try {
      const newModule = await createModule({
        course: courseId,
        module_name: moduleName,
        module_order: course.modules.length + 1,
        summary,
      });

      setCourse((prev) => ({
        ...prev,
        modules: [...prev.modules, { ...newModule, lessons: [] }],
      }));

      setModuleName("");
      setSummary("");
    } catch {
      alert("Failed to create module");
    }
  }

  // ---------- UPDATE MODULE ----------
  async function handleUpdateModule() {
    try {
      const res = await updateModule(editingModule.id, {
        module_name: editName,
        summary: editSummary,
      });

      const updated = res.data;

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === updated.id ? { ...updated, lessons: m.lessons } : m
        ),
      }));

      setEditingModule(null);
    } catch {
      alert("Failed to update module");
    }
  }

  // ---------- DELETE MODULE ----------
  async function handleDeleteModule() {
    try {
      await deleteModule(deletingId);

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules
          .filter((m) => m.id !== deletingId)
          .map((m, index) => ({ ...m, module_order: index + 1 })),
      }));

      setDeletingId(null);
    } catch {
      alert("Failed to delete module");
    }
  }

  // ---------- ADD LESSON ----------
  async function handleAddLesson(e, moduleId) {
    e.preventDefault();

    try {
      const newLesson = await createLesson({
        module: moduleId,
        lesson_name: lessonName,
        content: lessonContent,
        duration: lessonDuration || null,
      });

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...m.lessons, newLesson] }
            : m
        ),
      }));

      setLessonName("");
      setLessonContent("");
      setLessonDuration("");
      setActiveModuleId(null);
    } catch {
      alert("Failed to create lesson");
    }
  }

  // ---------- EDIT LESSON ----------
  function openEditLesson(lesson) {
    setEditingLesson(lesson);
    setEditLessonName(lesson.lesson_name);
    setEditLessonContent(lesson.content || "");
    setEditLessonDuration(lesson.duration || "");
  }

  async function handleSaveLesson() {
    if (!editingLesson) return;

    try {
      setSavingLesson(true);

      const updated = await updateLesson(editingLesson.id, {
        lesson_name: editLessonName,
        content: editLessonContent,
        duration: editLessonDuration || null,
      });

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (!m.lessons.some((l) => l.id === updated.id)) return m;

          return {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === updated.id ? updated : l
            ),
          };
        }),
      }));

      setEditingLesson(null);
    } catch {
      alert("Failed to update lesson");
    } finally {
      setSavingLesson(false);
    }
  }

  // ---------- DELETE LESSON ----------
  async function handleDeleteLesson(moduleId, lessonId) {
    if (!window.confirm("Delete this lesson?")) return;

    try {
      setDeletingLessonId(lessonId);
      await deleteLesson(lessonId);

      setCourse((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: m.lessons.filter((l) => l.id !== lessonId),
              }
            : m
        ),
      }));
    } catch {
      alert("Failed to delete lesson");
    } finally {
      setDeletingLessonId(null);
    }
  }

  if (loading || !course) {
    return <p className="text-center mt-5">Loading course...</p>;
  }

  return (
    <div className="container py-5">
      <Link to="/dashboard/instructor" className="btn btn-light mb-3">
        ← Back to Instructor Dashboard
      </Link>

      <h2 className="fw-bold">{course.course_name}</h2>
      <p className="text-muted">{course.description}</p>

      {/* MODULE LIST */}
      <h4 className="mt-4 mb-3">Modules</h4>

      {course.modules.length === 0 ? (
        <p className="text-muted">No modules added yet.</p>
      ) : (
        <ul className="list-group mb-4">
          {course.modules.map((module) => (
            <li key={module.id} className="list-group-item">
              <div className="d-flex justify-content-between mb-2">
                <strong>{module.module_name}</strong>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setEditingModule(module);
                      setEditName(module.module_name);
                      setEditSummary(module.summary || "");
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setDeletingId(module.id)}
                  >
                    Delete
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      setActiveModuleId(
                        activeModuleId === module.id ? null : module.id
                      )
                    }
                  >
                    + Lesson
                  </button>
                </div>
              </div>

              {module.lessons.length === 0 ? (
                <p className="text-muted ms-3">No lessons yet.</p>
              ) : (
                <ul className="list-group list-group-flush ms-3">
                  {module.lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>
                        {index + 1}. {lesson.lesson_name}
                      </span>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openEditLesson(lesson)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingLessonId === lesson.id}
                          onClick={() =>
                            handleDeleteLesson(module.id, lesson.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {activeModuleId === module.id && (
                <form
                  className="border rounded p-3 mt-2"
                  onSubmit={(e) => handleAddLesson(e, module.id)}
                >
                  <input
                    className="form-control mb-2"
                    placeholder="Lesson name"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    required
                  />
                  <textarea
                    className="form-control mb-2"
                    rows="2"
                    placeholder="Lesson content"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Duration"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                  />
                  <button className="btn btn-sm btn-success">
                    Save Lesson
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ADD MODULE */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Add New Module</h5>

          <form onSubmit={handleAddModule}>
            <input
              className="form-control mb-3"
              placeholder="Module name"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              required
            />
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <button className="btn btn-primary">Add Module</button>
          </form>
        </div>
      </div>

      {/* EDIT LESSON MODAL (UI UNCHANGED) */}
      {editingLesson && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Lesson</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditingLesson(null)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  value={editLessonName}
                  onChange={(e) => setEditLessonName(e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={editLessonContent}
                  onChange={(e) => setEditLessonContent(e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  value={editLessonDuration}
                  onChange={(e) => setEditLessonDuration(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingLesson(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={savingLesson}
                  onClick={handleSaveLesson}
                >
                  {savingLesson ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODULE MODAL */}
      {editingModule && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Module</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditingModule(null)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <textarea
                  className="form-control"
                  rows="3"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingModule(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateModule}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODULE MODAL */}
      {deletingId && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center">
                <p>Delete this module permanently?</p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDeletingId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteModule}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
