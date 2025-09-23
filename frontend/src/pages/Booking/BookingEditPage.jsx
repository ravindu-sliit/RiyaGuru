import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditBooking() {
  const { id } = useParams(); // 👈 bookingId (e.g. B001)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    courseName: "",
    instructorName: "",
    vehicleRegNo: "",
    date: "",
    time: "",
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ✅ Fetch booking by bookingId
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("rg_token");
        const res = await axios.get(`/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const b = res.data.booking;
        setFormData({
          courseName: b.courseName || "",
          instructorName: b.instructorName || "",
          vehicleRegNo: b.vehicleRegNo || "",
          date: b.date || "",
          // ✅ always enforce "HH:mm" format for <input type="time">
          time: b.time ? b.time.substring(0, 5) : "",
        });
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ensure time stays in "HH:mm" format
    if (name === "time") {
      const formatted = value.length > 5 ? value.substring(0, 5) : value;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("rg_token");
      await axios.put(`/api/bookings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ Booking updated successfully!");
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (error) {
      setErr(error.response?.data?.message || "❌ Failed to update booking.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#0A1A2F]">
          Edit Booking
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading booking details…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {err && <p className="text-sm text-red-600">{err}</p>}
            {msg && <p className="text-sm text-green-600">{msg}</p>}

            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Course Name"
              className="w-full border px-4 py-2 rounded-md"
              required
            />

            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              placeholder="Instructor Name"
              className="w-full border px-4 py-2 rounded-md"
              required
            />

            <input
              type="text"
              name="vehicleRegNo"
              value={formData.vehicleRegNo}
              onChange={handleChange}
              placeholder="Vehicle Reg No"
              className="w-full border px-4 py-2 rounded-md"
              required
            />

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
              required
            />

            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-md font-semibold hover:opacity-90 transition"
            >
              Update Booking
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
