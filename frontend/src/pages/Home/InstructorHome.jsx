// src/pages/Home/InstructorHome.jsx
import { Users, BookOpen, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructorHome() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "My Students",
      description: "Track student progress and lessons",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      path: "/instructor/lesson-progress/students",
    },
    {
      title: "Lesson Entry",
      description: "Add or update lesson progress",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      path: "/instructor/lesson-entry",
    },
    {
      title: "Filter Students",
      description: "Check status across all learners",
      icon: <Filter className="w-6 h-6 text-orange-600" />,
      path: "/instructor/filter",
    },
    {
      title: "Bookings",
      description: "Manage your schedule",
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      path: "/instructor/instructorbooking",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Welcome Instructor</h1>
        <p className="text-sm text-gray-600">Manage your students and lessons</p>
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
