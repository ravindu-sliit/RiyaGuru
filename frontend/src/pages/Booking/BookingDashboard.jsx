import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Status Badge
const StatusBadge = ({ status = "" }) => {
  const colorMap = {
    confirmed: "bg-green-100 text-green-700 ring-1 ring-green-200",
    pending: "bg-[#F47C20]/10 text-[#F47C20] ring-1 ring-[#F47C20]/30",
    cancelled: "bg-red-100 text-red-700 ring-1 ring-red-200",
  };
  const cls =
    colorMap[status.toLowerCase()] ||
    "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}
    >
      {status.toUpperCase()}
    </span>
  );
};

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // fetch bookings
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("rg_token");
        if (!token) {
          setErr("You must be logged in to view bookings.");
          setLoading(false);
          return;
        }
        const res = await axios.get("/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data.bookings || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const token = localStorage.getItem("rg_token");
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setMsg("✅ Booking deleted successfully!");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to delete booking.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <header className="bg-[#0A1A2F] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold">My Bookings</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#0A1A2F]">Bookings</h2>
            <span className="text-sm text-gray-500">Total: {bookings.length}</span>
          </div>

          {msg && (
            <div className="px-6 py-2 text-sm text-green-600 border-b bg-green-50">
              {msg}
            </div>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Loading…</div>
            ) : err ? (
              <div className="p-6 text-sm text-red-600">{err}</div>
            ) : bookings.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No bookings found.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-[#F5F6FA]">
                  <tr className="text-left text-[#0A1A2F]/90">
                    <th className="px-6 py-3">Booking ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-t hover:bg-[#F5F6FA]/70">
                      {/* ✅ Use bookingId instead of _id */}
                      <td className="px-6 py-3 font-medium text-[#0A1A2F]">
                        {b.bookingId}
                      </td>
                      <td className="px-6 py-3">
                        {new Date(b.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">{b.time}</td>
                      <td className="px-6 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-3 space-x-2">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/bookings/${b._id}`)}
                          className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:opacity-90 transition"
                        >
                          View
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/bookings/${b._id}/edit`)}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:opacity-90 transition"
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:opacity-90 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
