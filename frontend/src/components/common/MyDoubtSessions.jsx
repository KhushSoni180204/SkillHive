import { useEffect, useState } from "react";
import { getMyDoubtSessions, getJoinInfo } from "../../services/apiClient";

export default function MyDoubtSessions() {
  const [sessions, setSessions] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const data = await getMyDoubtSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch doubt sessions", err);
      setSessions([]);
    }
  }

  async function handleJoin(sessionId) {
    setLoadingId(sessionId);

    try {
      const data = await getJoinInfo(sessionId);

      if (data.can_join) {
        window.open(data.meet_link, "_blank");
      } else {
        alert(data.detail || "Session not available yet.");
      }
    } catch (err) {
      console.error("Join failed", err);
      alert("You are not allowed to join this session.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mt-4">
      <h4 className="fw-bold mb-3">My Doubt Sessions</h4>

      {sessions.length === 0 && (
        <div className="alert alert-secondary">
          No doubt sessions yet.
        </div>
      )}

      <div className="list-group">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <h6 className="fw-bold mb-1">
                Session on {s.session_date}
              </h6>
              <small className="text-muted">
                Status: {s.status} · Participants: {s.participants_count}
              </small>
            </div>

            <button
              className="btn btn-success btn-sm"
              disabled={loadingId === s.id}
              onClick={() => handleJoin(s.id)}
            >
              {loadingId === s.id ? "Checking..." : "Join"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
