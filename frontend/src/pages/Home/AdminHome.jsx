// src/pages/Home/AdminHome.jsx
import { Users, Car, CreditCard, BookOpen, Calendar, LogOut, Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminHome() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const quickLinks = [
    {
      title: "Students",
      description: "View and manage student records",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      path: "/lesson-progress/students",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      hoverColor: "hover:bg-blue-100"
    },
    {
      title: "Vehicles",
      description: "Manage the driving school fleet",
      icon: <Car className="w-8 h-8 text-orange-600" />,
      path: "/dashboard",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      hoverColor: "hover:bg-orange-100"
    },
    {
      title: "Instructors",
      description: "Manage instructor profiles and schedules",
      icon: <Users className="w-8 h-8 text-green-600" />,
      path: "/Instructordashboard",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      hoverColor: "hover:bg-green-100"
    },
    {
      title: "Payments",
      description: "Oversee transactions and fees",
      icon: <CreditCard className="w-8 h-8 text-pink-600" />,
      path: "/payments",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-100",
      hoverColor: "hover:bg-pink-100"
    },
    {
      title: "Bookings",
      description: "Manage scheduling system",
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      path: "/bookings",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      hoverColor: "hover:bg-purple-100"
    },
    {
      title: "Lesson Tracking",
      description: "Track lesson progress across students",
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      path: "/lesson-progress",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      hoverColor: "hover:bg-green-100"
    },
    {
      title: "Manage Students",
      description: "View and manage student accounts",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      path: "/admin/students",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      hoverColor: "hover:bg-blue-100"
    },
  ];

  const handleLogout = () => {
    // Add your logout logic here (clear tokens, etc.)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header with Brand Colors */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left side - Welcome */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome Admin</h1>
                <p className="text-orange-100">Manage the driving school system efficiently</p>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">248</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">₹1,24,500</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Lessons</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        </div>

        {/* Modern Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => navigate(link.path)}
              className={`${link.bgColor} ${link.borderColor} ${link.hoverColor} group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                    {link.icon}
                  </div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors"></div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                  {link.title}
                </h3>
                
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                  {link.description}
                </p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600">Are you sure you want to logout from the admin panel?</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}