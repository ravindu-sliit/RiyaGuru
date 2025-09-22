import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import InstructorRoutes from "./routes/instructorRoutes";
import "./App.css";

// ⚡ Later you can import other modules like VehicleRoutes, BookingRoutes
// import VehicleRoutes from "./routes/vehicleRoutes";
// import BookingRoutes from "./routes/bookingRoutes";

function App() {
  return (
    <>
      {/* Central routes for the whole app */}
      <Routes>
        {/* Instructors */}
        <Route path="/*" element={<InstructorRoutes />} />

        {/* Vehicles (future) */}
        {/* <Route path="/vehicles/*" element={<VehicleRoutes />} /> */}

        {/* Bookings (future) */}
        {/* <Route path="/bookings/*" element={<BookingRoutes />} /> */}

        {/* Catch-all → redirect to Instructor dashboard */}
        <Route path="*" element={<Navigate to="/instructors" replace />} />
      </Routes>
    </>
  );
}

export default App;
