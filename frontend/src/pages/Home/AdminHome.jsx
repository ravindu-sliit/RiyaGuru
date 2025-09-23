// src/pages/Home/AdminHome.jsx
import { Users, Car, CreditCard, BookOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "Students",
      description: "View and manage student records",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      path: "/lesson-progress/students",
    },
    {
      title: "Vehicles",
      description: "Manage the driving school fleet",
      icon: <Car className="w-6 h-6 text-orange-600" />,
      path: "/vehicles",
    },
    {
      title: "Payments",
      description: "Oversee transactions and fees",
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      path: "/payments",
    },
    {
      title: "Bookings",
      description: "Manage scheduling system",
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      path: "/bookings",
    },
    {
      title: "Lesson Tracking",
      description: "Track lesson progress across students",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      path: "/lesson-progress",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Welcome Admin</h1>
        <p className="text-sm text-gray-600">Manage the driving school system</p>
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
