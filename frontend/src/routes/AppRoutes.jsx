// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Courses from "../pages/Courses";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminRegister from "../pages/AdminRegister";
import CourseDetails from "../pages/CourseDetails";
import Module from "../pages/Module";
import Lesson from "../pages/Lesson";
import StudentDoubtSessions from "../pages/StudentDoubtSessions";
import InstructorDoubtSessions from "../pages/InstructorDoubtSessions";

import AdminDashboard from "../pages/AdminDashboard";
import AdminAnalytics from "../pages/AdminAnalytics";
import StudentDashboard from "../pages/StudentDashboard";
import InstructorDashboard from "../pages/InstructorDashboard";
import ManageCourse from "../pages/ManageCourse";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";


export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/courses/:courseId/modules/:moduleId" element={<Module />} />
        <Route
          path="/courses/:courseId/modules/:moduleId/lessons/:lessonId"
          element={<Lesson />}
        />

        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/admin/register" element={<AdminRegister />} />

        {/* ---------- STUDENT ROUTES ---------- */}
        <Route
          path="/dashboard/student"
          element={
            <PrivateRoute role="student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/doubt-sessions"
          element={<StudentDoubtSessions />}
        />


        {/* ---------- INSTRUCTOR ROUTES ---------- */}
        <Route
          path="/dashboard/instructor"
          element={
            <PrivateRoute role="instructor">
              <InstructorDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/instructor/doubt-sessions"
          element={<InstructorDoubtSessions />}
        />

        <Route
          path="/dashboard/instructor/course/:courseId"
          element={
            <PrivateRoute role="instructor">
              <ManageCourse />
            </PrivateRoute>
          }
        />

        {/* ---------- COMMON AUTH ROUTES ---------- */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* --------- Admin Routes -------- */}
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/admin/analytics"
          element={
            <PrivateRoute role="admin">
              <AdminAnalytics />
            </PrivateRoute>
          }
        />


        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </MainLayout>
  );
}
