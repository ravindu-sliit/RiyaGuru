// src/pages/Booking/AddBookingPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import { toast } from "react-toastify";

export default function AddBookingPage() {
  const nav = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ course: "", date: "", time: "", instructorId: "", regNo: "" });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const data = await bookingService.getMyCourses();
      setCourses(data);
    } catch (err) {
      toast.error("Failed to load courses");
    }
  };

  const checkAvailability = async () => {
    if (!form.date || !form.time || !form.course) return;
    try {
      const data = await bookingService.checkAvailability(form.date, form.time);
      setInstructors(data.availableInstructors);
      setVehicles(data.availableVehicles);
    } catch (err) {
      toast.error("Failed to check availability");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await bookingService.createBooking(form);
      toast.success("Booking created!");
      nav("/bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create booking");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-lg font-bold mb-4">New Booking</h1>
      <form onSubmit={submit} className="space-y-4 bg-white border rounded-md shadow-sm p-4">
        {/* Course */}
        <div>
          <label className="block text-sm mb-1">Select Course</label>
          <select
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="w-full border rounded-md p-2 text-sm"
            required
          >
            <option value="">-- Select --</option>
            {courses.map((c, i) => (
              <option key={i} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
              required
              onBlur={checkAvailability}
            />
          </div>
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm mb-1">Instructor</label>
          <select
            value={form.instructorId}
            onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
            className="w-full border rounded-md p-2 text-sm"
            required
          >
            <option value="">-- Select --</option>
            {instructors.map((ins) => (
              <option key={ins._id} value={ins.instructorId}>
                {ins.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-sm mb-1">Vehicle</label>
          <select
            value={form.regNo}
            onChange={(e) => setForm({ ...form, regNo: e.target.value })}
            className="w-full border rounded-md p-2 text-sm"
            required
          >
            <option value="">-- Select --</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v.regNo}>
                {v.regNo} - {v.model}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
