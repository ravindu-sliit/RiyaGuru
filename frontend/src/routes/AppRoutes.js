// src/routes/AppRoutes.js
import {  Routes, Route, Navigate } from "react-router-dom";
import InstructorRoutes from "./instructorRoutes";

export default function AppRoutes() {
  return (

      <Routes>
        {/* Instructors */}
        <Route path="/*" element={<InstructorRoutes />} />

        {/* Catch-all → redirect to Instructor dashboard */}
        <Route path="*" element={<Navigate to="/instructors" replace />} />
      </Routes>
 
  );
}
