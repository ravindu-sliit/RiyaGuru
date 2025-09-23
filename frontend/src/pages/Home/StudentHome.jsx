// src/pages/Home/StudentHome.jsx
import { BookOpen, Calendar, Car, CreditCard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentHome() {
  const navigate = useNavigate();
  const studentId = localStorage.getItem("rg_id") || "";

  const quickLinks = [
    {
      title: "My Dashboard",
      description: "View progress and lessons",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      path: `/student/${studentId}/dashboard`,
    },
    {
      title: "Bookings",
      description: "Schedule or view your driving lessons",
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      path: "/bookings",
    },
    {
      title: "Vehicles",
      description: "See available training vehicles",
      icon: <Car className="w-6 h-6 text-orange-600" />,
      path: "/vehicles",
    },
    {
      title: "Payments",
      description: "View history and manage fees",
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      path: "/payments",
    },
    {
      title: "Profile",
      description: "Update details and preferences",
      icon: <User className="w-6 h-6 text-green-600" />,
      path: `/student/${studentId}/edit`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Welcome Student</h1>
        <p className="text-sm text-gray-600">Manage your learning journey</p>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, idx) => (
          <button
            key={idx}
            onClick={() => navigate(link.path)}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5 text-left border border-gray-100"
          >
            <div className="flex items-center gap-3">{link.icon}
              <h2 className="text-lg font-semibold text-gray-800">{link.title}</h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">{link.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
