import api from "./axiosInstance";

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// -----------AI Functionality------------

// ---------- DOUBT SESSIONS ----------
export async function joinDoubtSession(courseId, sessionDate) {
  const res = await api.post("/doubt-sessions/join/", {
    course_id: courseId,
    session_date: sessionDate,
  });
  return res.data;
}

export async function getMyDoubtSessions() {
  const res = await api.get("/doubt-sessions/my/");
  return res.data;
}

export async function getJoinInfo(sessionId) {
  const res = await api.get(`/doubt-sessions/${sessionId}/join/`);
  return res.data;
}

// Get all instructor doubt sessions
export async function getInstructorDoubtSessions() {
  const res = await api.get("/doubt-sessions/instructor/");
  return res.data;
}

// Update Google Meet link
export async function updateDoubtSessionMeetLink(sessionId, meetLink) {
  const res = await api.patch(
    `/doubt-sessions/${sessionId}/meet-link/`,
    { meet_link: meetLink }
  );
  return res.data;
}

// Update session status (scheduled → live → completed)
export async function updateDoubtSessionStatus(sessionId, status) {
  const res = await api.patch(
    `/doubt-sessions/${sessionId}/status/`,
    { status }
  );
  return res.data;
}

// ================= DOUBT SESSIONS (ZOOM) =================
export async function generateZoomLink(sessionId) {
  const res = await api.post(`/doubt-sessions/${sessionId}/generate-zoom/`);
  return res.data;
}


//-----------Admin------------
export async function getAllCourses(){
  const res = await api.get("/admin/courses/");
  return res.data;
}

export async function getAllUsers(){
  const res = await api.get("/admin/users/");
  return res.data; 
}

export async function deleteAdminCourse(courseId) {
  const res = await api.delete(`/admin/courses/${courseId}/delete/`);
  return res.data;
}

export async function toggleCourseStatusAdmin(courseId) {
  const res = await api.patch(
    `/admin/courses/${courseId}/toggle-status/`
  );
  return res.data;
}

export async function toggleUserStatus(userId) {
  const res = await api.patch(`/admin/users/${userId}/toggle-status/`);
  return res.data;
}

export async function deleteUser(userId) {
  const res = await api.delete(`/admin/users/${userId}/`);
  return res.data;
}

export async function getAdminAnalytics() {
  const res = await api.get("/admin/analytics/");
  return res.data;
}



// ---------- COURSES ----------
export async function getCourses() {
  const res = await api.get("/courses/");
  return res.data;
}

export async function getInstructorCourses(){
  const res = await api.get("/instructor/courses/");
  return res.data;
}

export async function getCourseDetail(id) {
  const res = await api.get(`/courses/${id}/full/`);
  return res.data;
}

export async function createCourse(data) {
  const res = await api.post("/courses/", data);
  return res.data;
}

export async function updateCourse(id, data) {
  const res = await api.put(`/courses/${id}/`, data);
  return res.data;
}

export async function deleteCourse(id) {
  const res = await api.delete(`/courses/${id}/`);
  return res.status;
}

// ---------- MODULES ----------
export async function createModule(data) {
  const res = await api.post("/modules/", data);
  return res.data;
}


export async function getModuleDetail(id) {
  const res = await api.get(`/modules/${id}/`);
  return res.data;
}


export async function updateModule(id, data) {
  const res = await api.put(`/modules/${id}/`, data);
  return res.data;
}


export async function deleteModule(id) {
  const res = await api.delete(`/modules/${id}/`);
  return res.status;
}


// ---------- LESSONS ----------
export async function createLesson(data) {
  const res = await api.post("/lessons/", data);
  return res.data;
}


export async function getLessonDetail(id) {
  const res = await api.get(`/lessons/${id}/`);
  return res.data;
}

export async function updateLesson(id, data) {
  const res = await api.put(`/lessons/${id}/`, data);
  return res.data;
}


export async function deleteLesson(id) {
  const res = await api.delete(`/lessons/${id}/`);
  return res.status;
}


export async function getLesson() {
  const res = await api.get("/lessons/");
  return res.data;
}

// ---------- LOGIN ----------
export async function loginUser(credentials) {
  const res = await api.post("/auth/login/", credentials);
  return res.data;
}

export default api;


// ---------- ENROLLMENT ----------
export async function enrollInCourse(courseId) {
  const res = await api.post("/enrollments/", {
    course_id: courseId,
  });
  return res.data;
}

export async function getEnrollments() {
  const res = await api.get("/enrollments/");
  return res.data;
}

// ---------- LESSON PROGRESS ----------
export async function markLessonComplete(lessonId) {
  const res = await api.post("/lesson-progress/", {
    lesson_id: lessonId,
  });
  return res.data;
}

export async function getLessonProgress() {
  const res = await api.get("/lesson-progress/");
  return res.data;
}


// ---------- MODULE PROGRESS ----------
export async function getModuleProgress(moduleId) {
  const res = await api.get(`/modules/${moduleId}/progress/`);
  return res.data;
}


// ---------- REGISTER ----------
export async function registerUser(data) {
  const res = await api.post("/auth/register/", data);
  return res.data;
}

//---------Instructor Analytics------------
export async function getInstructorAnalytics() {
  const res = await api.get("/instructor/analytics/");
  return res.data;
}

//------------Search Courses---------------
export async function searchCourses(query){
  const res = await api.get(`/courses/search/?q=${query}`);
  return res.data;
}

//------------Admin Registration-------------
export async function adminRegister(data) {
  const res = await api.post("/auth/admin/register/",data);
  return res.data;
}

//------------Ask AI----------------
export async function askai(data){
  const res = await api.post("ai/ask/",data);
  return res.data;
} 

//----------Generate Quiz-------------
export async function generateQuiz(data){
  const res = await api.post("ai/generate-quiz/",data);
  return res.data;
}