// src/routes/instructorRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import InstructorPage from "../pages/Instructor/InstructorPage";
import InstructorListPage from "../pages/Instructor/InstructorListPage";
import InstructorDetailsPage from "../pages/Instructor/InstructorDetailsPage";
import AddInstructorPage from "../pages/Instructor/AddInstructorPage";
import EditInstructorPage from "../pages/Instructor/EditInstructorPage";
import AvailabilityPage from "../pages/Instructor/AvailabilityPage";
import StatusFilterPage from "../pages/Instructor/StatusFilterPage";

export default function InstructorRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="instructors" element={<InstructorPage />} />

      {/* CRUD */}
      <Route path="instructors/list" element={<InstructorListPage />} />
      <Route path="instructors/add" element={<AddInstructorPage />} />
      <Route path="instructors/:id" element={<InstructorDetailsPage />} />
      <Route path="instructors/:id/edit" element={<EditInstructorPage />} />

      {/* Extra Features */}
      <Route path="instructors/availability" element={<AvailabilityPage />} />
      <Route path="instructors/status" element={<StatusFilterPage />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="instructors" replace />} />
    </Routes>
  );
}
