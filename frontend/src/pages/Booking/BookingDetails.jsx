import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Reuse Status Badge
const StatusBadge = ({ status = "" }) => {
  const colorMap = {
    confirmed: "bg-green-100 text-green-700 ring-1 ring-green-200",
    pending: "bg-[#F47C20]/10 text-[#F47C20] ring-1 ring-[#F47C20]/30",
    cancelled: "bg-red-100 text-red-700 ring-1 ring-red-200",
  };
  const cls = colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status.toUpperCase()}
    </span>
  );
};

// Helper Info Row
function Info({ label, value }) {
  return (
    <div className="flex justify-between py-1 border-b border-white/70 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-[#0A1A2F]">{value || "-"}</span>
    </div>
  );
}

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("rg_token");
        const res = await axios.get(`/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(res.data.booking);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <header className="bg-[#0A1A2F] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Booking Details</h1>
          <button
            onClick={() => navigate("/booking")}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : err ? (
          <div className="text-sm text-red-600">{err}</div>
        ) : !booking ? (
          <div className="text-sm text-gray-500">Booking not found.</div>
        ) : (
          <>
            <section className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#0A1A2F]">
                  Booking #{booking.bookingId}
                </h2>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(booking.date).toLocaleDateString()} · {booking.time}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F5F6FA] p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-[#0A1A2F] mb-2">Student</h3>
                  <Info label="Full Name" value={booking.student?.full_name} />
                  <Info label="Email" value={booking.student?.email} />
                  <Info label="Phone" value={booking.student?.phone} />
                </div>

                <div className="bg-[#F5F6FA] p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-[#0A1A2F] mb-2">Course</h3>
                  <Info label="Course Name" value={booking.course?.name} />
                  <Info label="Duration" value={booking.course?.duration} />
                  <Info label="Lessons" value={booking.course?.totalLessons + " lessons"} />
                  <Info label="Fee" value={`Rs. ${booking.course?.price?.toLocaleString()}`} />
                </div>

                <div className="bg-[#F5F6FA] p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-[#0A1A2F] mb-2">Instructor</h3>
                  <Info label="Name" value={booking.instructor?.name} />
                  <Info label="Phone" value={booking.instructor?.phone} />
                  <Info label="Specialization" value={booking.instructor?.specialization} />
                </div>

                <div className="bg-[#F5F6FA] p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-[#0A1A2F] mb-2">Vehicle</h3>
                  <Info label="Registration" value={booking.vehicle?.regNo} />
                  <Info label="Brand & Model" value={`${booking.vehicle?.brand} ${booking.vehicle?.model}`} />
                  <Info label="Type" value={booking.vehicle?.type} />
                  <Info label="Fuel" value={booking.vehicle?.fuelType} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#0A1A2F] mb-3">Important Information</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Arrive 15 minutes early.</li>
                <li>Bring a valid ID and required documents.</li>
                <li>Reschedule at least 24 hours in advance.</li>
                <li>Payment must be completed before the lesson.</li>
                <li>Follow all safety instructions from your instructor.</li>
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
