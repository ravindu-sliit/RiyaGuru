// src/routes/instructorRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import InstructorLayout from "../layouts/InstructorLayout";

// Pages
import InstructorLessonProgressHome from "../pages/Instructor/InstructorLessonProgressHome";
import InstructorLessonEntryPage from "../pages/Instructor/InstructorLessonEntryPage";
import InstructorListPage from "../pages/Instructor/InstructorListPage";
import InstructorDetailsPage from "../pages/Instructor/InstructorDetailsPage";
import AddInstructorPage from "../pages/Instructor/AddInstructorPage";
import EditInstructorPage from "../pages/Instructor/EditInstructorPage";
import AvailabilityPage from "../pages/Instructor/AvailabilityPage";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";
import ProfilePage from "../pages/Instructor/ProfilePage";

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

        {/* Instructor CRUD */}
        <Route path="instructors/list" element={<InstructorListPage />} />
        <Route path="instructors/:id" element={<InstructorDetailsPage />} />
        <Route path="instructors/add" element={<AddInstructorPage />} />
        <Route path="instructors/:id/edit" element={<EditInstructorPage />} />
        <Route path="instructors/availability" element={<AvailabilityPage />} />
        <Route path="instructors/status" element={<StatusFilterPage />} />

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
