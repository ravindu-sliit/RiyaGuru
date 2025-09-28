// src/routes/studentRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "../layouts/StudentLayout";
import StudentHome from "../pages/Home/StudentHome";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentDocUpload from "../pages/Student/StudentDocUpload";

import StudentPreferences from "../pages/Student/StudentPreferences";
import StudentProgressPage from "../pages/Student/StudentProgressPage";
import BookingDetails from "../pages/Booking/BookingDetails";
import StudentPasswordChange from "../pages/Student/StudentPasswordChange";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentHome />} />

        <Route path=":id/dashboard" element={<StudentDashboard />} />

        <Route path="progress" element={<StudentProgressPage />} />

        <Route path=":id/docs/upload" element={<StudentDocUpload />} />

        

        <Route path=":id/preferences" element={<StudentPreferences />} />

        <Route path=":id/password" element={<StudentPasswordChange />} />

        <Route path="bookings" element={<BookingDetails />} />

        <Route path="*" element={<Navigate to="/student" replace />} />
        
      </Route>
    </Routes>
  );
}
