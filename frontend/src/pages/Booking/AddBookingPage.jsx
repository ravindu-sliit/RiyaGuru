import React, { useState } from "react";
import axios from "axios";

export default function AddBookingPage() {
  const [courseName, setCourseName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [vehicleRegNo, setVehicleRegNo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("rg_token");
      const studentId = localStorage.getItem("rg_userId");

      if (!token || !studentId) {
        setMsg("❌ You must be logged in to create a booking.");
        return;
      }

      await axios.post(
        "/api/bookings",
        { studentId, courseName, instructorName, vehicleRegNo, date, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg("✅ Booking created successfully!");
      setCourseName("");
      setInstructorName("");
      setVehicleRegNo("");
      setDate("");
      setTime("");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to create booking");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-[#0A1A2F] mb-4">Add Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name */}
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Instructor Name */}
          <input
            type="text"
            placeholder="Instructor Name"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Vehicle Reg No */}
          <input
            type="text"
            placeholder="Vehicle Reg No"
            value={vehicleRegNo}
            onChange={(e) => setVehicleRegNo(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Time */}
          <input
            type="text"
            placeholder="Time (e.g. 10:00 AM)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#F47C20] text-white py-2 rounded hover:opacity-90 transition"
          >
            Submit
          </button>
        </form>

        {/* Message */}
        {msg && (
          <p
            className={`mt-4 text-sm text-center ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
