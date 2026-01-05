import axios from "axios";

const API_BASE = "http://localhost/api/doubt-sessions/";

export function joinDoubtSession(courseId, sessionDate) {
  return axios.post(
    `${API_BASE}join/`,
    {
      course_id: courseId,
      session_date: sessionDate,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    }
  );
}

export function getMyDoubtSessions() {
  return axios.get(`${API_BASE}my/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}

export function getJoinInfo(sessionId) {
  return axios.get(`${API_BASE}${sessionId}/join/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
}
