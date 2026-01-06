import { useState } from "react";
import { joinDoubtSession } from "../../services/apiClient";

export default function RequestDoubtSession({ courseId }) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleJoin() {
    setLoading(true);
    setMessage("");

    try {
      await joinDoubtSession(courseId, date);
      setMessage("You have joined the doubt session.");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold">Request a doubt session</h5>

        <label className="form-label mt-2">Choose session date</label>
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={handleJoin}
          disabled={!date || loading}
        >
          {loading ? "Joining..." : "Request / Join Doubt Session"}
        </button>

        {message && (
          <div className="alert alert-info mt-3 mb-0">{message}</div>
        )}
      </div>
    </div>
  );
}
