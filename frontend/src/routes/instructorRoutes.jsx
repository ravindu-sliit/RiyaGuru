// src/routes/instructorRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import InstructorLayout from "../layouts/InstructorLayout";

// Pages
import InstructorLessonProgressHome from "../pages/Instructor/InstructorLessonProgressHome";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";

import ProfilePage from "../pages/Instructor/InstructorProfile";

import LessonProgressDashboard from "../pages/LessonProgress/LessonProgressDashboard";
import LessonProgressList from "../pages/LessonProgress/LessonProgressList";
import StudentList from "../pages/LessonProgress/StudentList";
import StudentLessons from "../pages/LessonProgress/StudentLessons";
import ProgressTrackingDashboard from "../pages/ProgressTracking/ProgressTrackingDashboard";

export default function InstructorRoutes() {
  return (
    <Routes>
      <Route element={<InstructorLayout />}>
        {/* Dashboard (default) */}
        <Route index element={<InstructorLessonProgressHome />} />

       

       

        {/* Lesson Progress */}
        <Route path="lesson-entry" element={<InstructorLessonEntryPage />} />
        <Route path="lesson-progress" element={<LessonProgressDashboard />} />
        <Route path="lesson-progress/all" element={<LessonProgressList />} />
        <Route path="lesson-progress/students" element={<StudentList />} />
        <Route path="lesson-progress/student/:studentId" element={<StudentLessons />} />

        {/* Progress Tracking */}
        <Route path="progress-tracking" element={<ProgressTrackingDashboard />} />

        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/instructor" replace />} />
      </Route>
    </Routes>
  );
}
