// src/pages/Home/StudentHome.jsx
import {
  BookOpen,
  Calendar,
  Car,
  CreditCard,
  User,
  FileText,
  Settings,
  Lock,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { BookingAPI } from "../../api/bookingsApi";
import { PaymentAPI } from "../../api/paymentApi";

export default function StudentHome() {
  const studentId =
    localStorage.getItem("rg_userId") || localStorage.getItem("rg_id");

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [progressCourses, setProgressCourses] = useState([]);
  const [avgProgress, setAvgProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        // Bookings
        const allBookings = await BookingAPI.getAll();
        const myBookings = (Array.isArray(allBookings) ? allBookings : [])
          .filter((b) => String(b.userId || b.studentId || "") === String(studentId));
        setBookings(myBookings);

        // Payments
        const allPayments = await PaymentAPI.getAll();
        const pList = Array.isArray(allPayments?.payments)
          ? allPayments.payments
          : Array.isArray(allPayments)
          ? allPayments
          : [];
        const myPayments = pList.filter((p) => {
          const cands = [p.studentId, p.student_id, p.createdBy, p.created_by, p.studentName]
            .filter(Boolean)
            .map((v) => String(v));
          return cands.includes(String(studentId));
        });
        // Sort latest first
        myPayments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setPayments(myPayments);

        // Progress (reuse same endpoints as StudentProgressPage)
        try {
          const profileRes = await fetch(
            "http://localhost:5000/api/students/me/profile",
            { headers: { Authorization: `Bearer ${localStorage.getItem("rg_token")}` } }
          );
          if (profileRes.ok) {
            const { student } = await profileRes.json();
            const progRes = await fetch(
              `http://localhost:5000/api/progress-reports/student/${student.studentId}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("rg_token")}` } }
            );
            if (progRes.ok) {
              const progData = await progRes.json();
              const courses = Array.isArray(progData?.courses) ? progData.courses : [];
              setProgressCourses(courses);
              const avg = courses.length
                ? Math.round(courses.reduce((s, c) => s + (Number(c.progress_percent) || 0), 0) / courses.length)
                : 0;
              setAvgProgress(avg);
            }
          }
        } catch (_) {
          // Ignore progress errors on home widget
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    if (studentId) load();
  }, [studentId]);

  const nextLesson = useMemo(() => {
    const now = new Date();
    const upcoming = bookings
      .filter((b) => {
        const d = new Date(b.date);
        return !isNaN(d) && d >= now && ["pending", "booked"].includes(String(b.status || "").toLowerCase());
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0];
  }, [bookings]);

  const nextLessons = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        const d = new Date(b.date);
        return !isNaN(d) && d >= now && ["pending", "booked"].includes(String(b.status || "").toLowerCase());
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [bookings]);

  const bookingStats = useMemo(() => {
    const counts = bookings.reduce(
      (acc, b) => {
        const s = String(b.status || "pending").toLowerCase();
        acc.total += 1;
        if (s === "pending") acc.pending += 1;
        else if (s === "booked") acc.booked += 1;
        else if (s === "completed") acc.completed += 1;
        else if (s === "cancelled") acc.cancelled += 1;
        return acc;
      },
      { total: 0, pending: 0, booked: 0, completed: 0, cancelled: 0 }
    );
    return counts;
  }, [bookings]);

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">
          No student ID found. Please log in again.
        </p>
      </div>
    );
  }

  const quickLinks = [
    {
      title: "Progress Dashboard",
      description: "Track courses, lessons, and certificates",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      path: "/student/progress",
    },
    {
      title: "Bookings",
      description: "Schedule or view your driving lessons",
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      path: "/student/bookings",
    },
    {
      title: "Instructors",
      description: "See available training vehicles",
      icon: <User className="w-6 h-6 text-green-600" />,
      path: "/student/student-instructors",
    },
    {
      title: "Vehicles",
      description: "See available training vehicles",
      icon: <Car className="w-6 h-6 text-orange-600" />,
      path: "/student/studVehicle",
    },
    {
      title: "My Payments",
      description: "See your payment history and receipts",
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      path: "/student/my-payments",
    },
   
    {
      title: "Preferences",
      description: "Set course or lesson preferences",
      icon: <Settings className="w-6 h-6 text-teal-600" />,
      path: `/student/${studentId}/preferences`,
    },
    
  ];

  return (
    <div className="px-4 sm:px-6 py-6">
      {/* Top Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Upcoming Lesson */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Upcoming Lesson</h3>
            </div>
            <Link to="/student/bookings" className="text-sm text-purple-600 hover:underline">View</Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : nextLessons.length > 0 ? (
            <div className="space-y-2">
              {nextLessons.map((lesson) => (
                <div key={lesson._id || `${lesson.date}-${lesson.time}`} className="p-2 rounded-md border border-white/40 bg-white/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] leading-tight font-semibold text-gray-900 truncate" title={lesson.course || "Lesson"}>
                      {lesson.course || "Lesson"}
                    </p>
                    {lesson.time && (
                      <p className="text-[13px] font-semibold text-gray-900">{lesson.time}</p>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-700">{new Date(lesson.date).toLocaleDateString("en-GB")}</p>
                    {lesson.status && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${String(lesson.status).toLowerCase() === "booked" ? "bg-green-100 text-green-700" : String(lesson.status).toLowerCase() === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                        {String(lesson.status).charAt(0).toUpperCase() + String(lesson.status).slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">No upcoming lessons</p>
          )}
          <div className="mt-4">
            <Link
              to="/student/Addbookings"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium shadow-sm"
            >
              Schedule
            </Link>
          </div>
        </div>

        {/* Booking Status */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Bookings Status</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-blue-50/80">
              <p className="text-xs text-gray-700">Total</p>
              <p className="text-lg font-semibold text-gray-900">{bookingStats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/80">
              <p className="text-xs text-gray-700">Pending</p>
              <p className="text-lg font-semibold text-amber-700">{bookingStats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50/80">
              <p className="text-xs text-gray-700">Booked</p>
              <p className="text-lg font-semibold text-green-700">{bookingStats.booked}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50/80">
              <p className="text-xs text-gray-700">Completed</p>
              <p className="text-lg font-semibold text-gray-700">{bookingStats.completed}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/student/bookings" className="text-sm text-gray-800 underline">Manage bookings</Link>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Progress</h3>
            </div>
            <Link to="/student/progress" className="text-sm text-indigo-600 hover:underline">View</Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : progressCourses.length === 0 ? (
            <p className="text-sm text-gray-700">No progress available</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Average</span>
                <span className="text-sm font-semibold text-gray-900">{avgProgress}%</span>
              </div>
              {progressCourses.slice(0, 3).map((c) => {
                const pct = Math.max(0, Math.min(100, Number(c.progress_percent) || 0));
                return (
                  <div key={c.course_name}>
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span className="truncate pr-2" title={c.course_name}>{c.course_name}</span>
                      <span className="text-gray-800 font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 mt-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pink-600" />
              <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            </div>
            <Link to="/student/my-payments" className="text-sm text-pink-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-700">No payments found</p>
          ) : (
            <div className="space-y-2">
              {payments.slice(0, 3).map((p) => (
                <div key={p._id} className="p-2 rounded-md border border-white/40 bg-white/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] leading-tight font-semibold text-gray-900 truncate" title={p.courseName || "Payment"}>
                      {p.courseName || "Payment"}
                    </p>
                    {p.amount != null && (
                      <p className="text-[13px] font-semibold text-gray-900">${Number(p.amount).toFixed(2)}</p>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-700">{new Date(p.createdAt).toLocaleDateString("en-GB")}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${p.status === "Approved" ? "bg-green-100 text-green-700" : p.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow hover:shadow-md transition p-5 text-left block"
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <h2 className="text-lg font-semibold text-gray-900">
                {link.title}
              </h2>
            </div>
            <p className="text-sm text-gray-700 mt-2">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
