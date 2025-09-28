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

export default function StudentHome() {
  const studentId = localStorage.getItem("rg_id");

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
      title: "Vehicles",
      description: "See available training vehicles",
      icon: <Car className="w-6 h-6 text-orange-600" />,
      path: "/vehicles",
    },
    {
      title: "My Enrollments",
      description: "View enrolled courses and pay fees",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      path: "/my-enrollments",
    },
    {
      title: "My Payments",
      description: "See your payment history and receipts",
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      path: "/my-payments",
    },
    {
      title: "Profile",
      description: "Update details and view student dashboard",
      icon: <User className="w-6 h-6 text-green-600" />,
      path: `/student/${studentId}/dashboard`,
    },
    {
      title: "My Documents",
      description: "Upload driving license, NIC, and other docs",
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      path: `/student/${studentId}/docs/upload`,
    },
    {
      title: "Preferences",
      description: "Set course or lesson preferences",
      icon: <Settings className="w-6 h-6 text-teal-600" />,
      path: `/student/${studentId}/preferences`,
    },
    {
      title: "Change Password",
      description: "Update your login password",
      icon: <Lock className="w-6 h-6 text-red-600" />,
      path: `/student/${studentId}/password`,
    },
    {
      title: "Inquiries",
      description: "Ask questions or contact support",
      icon: <HelpCircle className="w-6 h-6 text-gray-600" />,
      path: "/inquiry",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome Student</h1>
      <p className="text-sm text-gray-600 mb-6">
        Manage your learning journey with quick access
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5 text-left border border-gray-100 block"
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <h2 className="text-lg font-semibold text-gray-800">
                {link.title}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
