import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Car, AlertTriangle, X } from "lucide-react";

export default function InstructorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [instructor, setInstructor] = useState(null);

  // 🔹 Fetch Instructor Profile + Bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("rg_token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch instructor profile
        const profileRes = await axios.get(
          "http://localhost:5000/api/instructors/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInstructor(profileRes.data.instructor);

        // Fetch instructor bookings
        const { data } = await axios.get(
          "http://localhost:5000/api/instructors/me/bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Cancel booking
  const handleCancel = async (id) => {
    const token = localStorage.getItem("rg_token");
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === id ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking.");
    }
  };

  // ✅ Status badge
  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700 border-amber-200",
      Confirmed: "bg-green-100 text-green-700 border-green-200",
      Completed: "bg-blue-100 text-blue-700 border-blue-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${
          styles[status] ||
          "bg-gray-100 text-gray-700 border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <h1 className="font-bold text-xl text-gray-800">
          Instructor Booking Details
        </h1>
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/instructor/profile"
            className="px-4 py-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all font-medium"
          >
            My Profile
          </Link>
          <Link
            to="/instructor/bookings"
            className="px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium"
          >
            My Bookings
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-gray-600">
              All bookings assigned to you as an instructor
            </p>
            {instructor && (
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Instructor ID:</span>{" "}
                {instructor.instructorId} |{" "}
                <span className="font-medium">Name:</span> {instructor.name}
              </p>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {bookings.map((b) => (
              <div
                key={b.bookingId}
                className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-sm text-gray-500">
                    #{b.bookingId}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {b.courseName}
                </h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Student: <span className="font-medium">{b.studentId}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Vehicle:{" "}
                    <span className="font-medium">{b.vehicleRegNo}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Date: <span className="font-medium">{b.date}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Time: <span className="font-medium">{b.time}</span>
                  </p>
                </div>

                {/* Cancel Button */}
                {b.status !== "Cancelled" && (
                  <button
                    onClick={() => handleCancel(b.bookingId)}
                    className="mt-4 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    <X className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white shadow-sm rounded-xl border border-gray-200">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-600 font-medium mb-1">No bookings found</p>
            <p className="text-sm text-gray-500">
              Your bookings will appear here once scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
