import { useEffect, useState } from "react";
import {
  getInstructorDoubtSessions,
  updateDoubtSessionMeetLink,
  updateDoubtSessionStatus,
  generateZoomLink,
} from "../services/apiClient";

export default function InstructorDoubtSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setLoading(true);
    try {
      const data = await getInstructorDoubtSessions();
      setSessions(data || []);
    } catch {
      alert("Failed to load doubt sessions");
    } finally {
      setLoading(false);
    }
  }

  async function saveMeetLink(id, meetLink) {
    if (!meetLink) {
      alert("Meet link cannot be empty");
      return;
    }

    setBusyId(id);
    try {
      await updateDoubtSessionMeetLink(id, meetLink);
      fetchSessions();
    } catch {
      alert("Failed to save meet link");
    } finally {
      setBusyId(null);
    }
  }

  async function handleGenerateZoom(id) {
    setBusyId(id);
    try {
      await generateZoomLink(id);
      alert("Zoom link generated");
      fetchSessions();
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
        "Failed to generate Zoom link"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatusChange(id, status) {
    setBusyId(id);
    try {
      await updateDoubtSessionStatus(id, status);
      fetchSessions();
    } catch {
      alert("Failed to update session status");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-3">📅 Doubt Sessions</h3>

      {loading && <p>Loading sessions...</p>}

      {!loading && sessions.length === 0 && (
        <div className="alert alert-secondary">
          No doubt sessions found.
        </div>
      )}

      <div className="list-group">
        {sessions.map((s) => (
          <div key={s.id} className="list-group-item mb-3">

            {/* HEADER */}
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="fw-bold mb-1">
                  {s.course_name} — {s.session_date}
                </h6>
                <small className="text-muted">
                  {s.start_time} – {s.end_time} · Participants: {s.participants_count}
                </small>
              </div>

              <span
                className={`badge ${
                  s.status === "scheduled"
                    ? "bg-warning"
                    : s.status === "live"
                    ? "bg-success"
                    : s.status === "completed"
                    ? "bg-secondary"
                    : "bg-danger"
                }`}
              >
                {s.status}
              </span>
            </div>

            {/* MEET LINK INPUT */}
            {s.status === "scheduled" && (
              <div className="mt-3">
                <label className="form-label fw-semibold">
                  Meeting Link (Manual)
                </label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Paste Google Meet / Zoom link"
                  defaultValue={s.meet_link || ""}
                  disabled={busyId === s.id}
                  onBlur={(e) =>
                    saveMeetLink(s.id, e.target.value)
                  }
                />
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="d-flex gap-2 flex-wrap mt-2">

              {/* Generate Zoom */}
              {s.status === "scheduled" && !s.meet_link && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={busyId === s.id}
                  onClick={() => handleGenerateZoom(s.id)}
                >
                  Generate Zoom Link
                </button>
              )}

              {/* Go Live */}
              {s.status === "scheduled" && s.meet_link && (
                <button
                  className="btn btn-success btn-sm"
                  disabled={busyId === s.id}
                  onClick={() => handleStatusChange(s.id, "live")}
                >
                  Go Live
                </button>
              )}

              {/* Cancel */}
              {s.status === "scheduled" && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  disabled={busyId === s.id}
                  onClick={() => handleStatusChange(s.id, "cancelled")}
                >
                  Cancel
                </button>
              )}

              {/* Complete */}
              {s.status === "live" && (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busyId === s.id}
                  onClick={() => handleStatusChange(s.id, "completed")}
                >
                  Mark Completed
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
