// src/pages/Booking/BookingDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import bookingService from "../../services/bookingService";

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.length,
    booked: bookings.filter((b) => b.status === "booked").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-3"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center bg-white px-6 py-3 border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-base text-gray-800">
          <Calendar className="text-orange-500 w-5 h-5" />
          My Bookings
        </div>
        <Link
          to="/bookings/add"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600"
        >
          <Plus size={16} /> New Booking
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { title: "Total", value: stats.total, color: "blue", icon: <Calendar size={18} /> },
          { title: "Booked", value: stats.booked, color: "orange", icon: <Clock size={18} /> },
          { title: "Completed", value: stats.completed, color: "green", icon: <CheckCircle size={18} /> },
          { title: "Cancelled", value: stats.cancelled, color: "red", icon: <XCircle size={18} /> },
        ].map((s, i) => (
          <div
            key={i}
            className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${s.color}-500`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{s.title}</span>
              <span className={`text-${s.color}-500`}>{s.icon}</span>
            </div>
            <div className="text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bookings List */}
      <div className="px-6 pb-10">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b text-sm font-semibold text-slate-700">Recent Bookings</div>
          <div className="divide-y text-sm">
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <div
                  key={b._id}
                  className="flex justify-between items-center p-4 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="font-medium text-slate-800">{b.course} Training</p>
                    <p className="text-xs text-slate-600">
                      {b.date} • {b.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status === "booked"
                          ? "bg-blue-100 text-blue-600"
                          : b.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {b.status}
                    </span>
                    <Link
                      to={`/bookings/${b._id}`}
                      className="text-orange-500 hover:underline text-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-6 text-sm">No bookings found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
