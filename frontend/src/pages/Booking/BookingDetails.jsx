import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { BookingAPI } from "../../api/bookingsApi";
import ProgressHero from "../../components/ProgressHero";
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Download,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const BookingDetails = () => {
  const [filteredBookings, setFilteredBookings] = useState([]);
  const navigate = useNavigate();

  // 🔹 Fetch only current user's bookings
  const fetchBookings = async () => {
    try {
      const response = await BookingAPI.getAll();
      const userBookings = response.filter(
        (booking) => booking.userId === localStorage.getItem("rg_userId")
      );
      setFilteredBookings(userBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔄 Auto-refresh bookings so status updates when admin confirms
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBookings();
    }, 10000); // every 10s
    return () => clearInterval(intervalId);
  }, []);

  // 🔹 Delete booking
  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await BookingAPI.remove(bookingId);
        alert("Booking deleted successfully!");
        fetchBookings();
      } catch (error) {
        alert("Failed to delete booking. Please try again.");
      }
    }
  };

  // 🔹 Download PDF Receipt
  const handleDownloadReceipt = (bookingId) => {
    const fileName = `booking_${bookingId}.pdf`;
    const downloadUrl = `http://localhost:5000/uploads/${fileName}`;
    window.open(downloadUrl, "_blank");
  };

  


  // 🔹 Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      booked: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <X className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — match Progress page (navy translucent) */}
      <div className="px-6 pt-6">
        <ProgressHero
          title="My Bookings"
          subtitle="Manage your driving lesson appointments"
          icon={<Calendar className="w-8 h-8 text-white" />}
        >
          <button
            onClick={() => navigate("/student/Addbookings")}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" /> New Booking
          </button>
        </ProgressHero>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start your driving journey by creating your first booking
            </p>
            <button
              onClick={() => navigate("/student/Addbookings")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5" /> Create Your First Booking
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-2xl p-6 bg-white hover:shadow-lg transition"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1">
                    <div>
                      <p className="text-sm text-gray-600">Course</p>
                      <p className="font-semibold">{booking.course}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instructor</p>
                      <p className="font-semibold">{booking.instructorId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-semibold">{booking.regNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold">
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{booking.time}</p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {getStatusBadge(booking.status)}

                    {/* Pending: only Edit + Delete */}
                    {booking.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            navigate(`/student/edit-booking/${booking._id}`)
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}

                    {/* Booked: full actions */}
                    {booking.status === "booked" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleDownloadReceipt(booking.bookingId)
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
                        >
                          <Download className="w-4 h-4" /> Receipt
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/student/edit-booking/${booking._id}`)
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
