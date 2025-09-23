// src/pages/Home/Home.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Car, BookOpen, CreditCard, Calendar } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Example: check role from localStorage and redirect if needed
    const role = localStorage.getItem("rg_role");
    if (!role) {
      navigate("/login");
    }
  }, [navigate]);

  const quickLinks = [
    {
      title: "My Profile",
      description: "Update your details and preferences",
      icon: <User className="w-6 h-6 text-blue-600" />,
      path: "/student/:id/dashboard",
    },
    {
      title: "Lessons",
      description: "Track and manage your lessons",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      path: "/lesson-progress",
    },
    {
      title: "Bookings",
      description: "View and schedule driving sessions",
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      path: "/bookings",
    },
    {
      title: "Vehicles",
      description: "Browse and manage available vehicles",
      icon: <Car className="w-6 h-6 text-orange-600" />,
      path: "/vehicles",
    },
    {
      title: "Payments",
      description: "Check your payment history and dues",
      icon: <CreditCard className="w-6 h-6 text-pink-600" />,
      path: "/payments",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Welcome to RiyaGuru</h1>
        <p className="text-sm text-gray-600">Your driving school companion</p>
      </div>

      {/* Quick Links */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => navigate(link.path.replace(":id", localStorage.getItem("rg_id") || ""))}
            className="bg-white rounded-xl shadow hover:shadow-md transition p-5 text-left border border-gray-100"
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <h2 className="text-lg font-semibold text-gray-800">
                {link.title}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-2">{link.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
