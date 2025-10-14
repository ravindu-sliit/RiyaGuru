import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {  ArrowLeft } from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import {
  Car,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  TrendingUp,
  Calendar,

} from "lucide-react";
import { toast } from "react-toastify";



const VehicleDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);

      setStats({
        total: data.length,
        active: data.filter((v) => v.status === "Active").length,
        inactive: data.filter((v) => v.status === "Not-Active").length,
        maintenance: data.filter((v) => v.status === "Maintenance").length,
      });
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const recentVehicles = vehicles
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700";
      case "Not-Active":
        return "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700";
      case "Maintenance":
        return "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700";
      default:
        return "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600";
    }
  };
 const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle size={14} />;
      case "Not-Active":
        return <Users size={14} />;
      case "Maintenance":
        return <AlertTriangle size={14} />;
      default:
        return <Car size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-3"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 🔙 Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Vehicle Management</h1>
                <p className="text-orange-100">Monitor and manage all Vehicles</p>
              </div>
              
            </div>
            
            <div className="flex items-center gap-3">
             
              
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 py-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Vehicle Management
          </h1>
          <p className="text-gray-800 font-medium">
            Manage your driving school fleet efficiently
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Link
            to="/admin/vehicles"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-gray-800 hover:text-orange-600 hover:bg-orange-50"
          >
            <Car size={16} /> All Vehicles
          </Link>
          <Link
            to="/admin/vehicles/add"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
          >
            <Plus size={16} /> Add Vehicle
          </Link>
          
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6 pt-2">
        {[
          {
            title: "Total Vehicles",
            value: stats.total,
            subtitle: "Fleet size",
            color: "border-blue-500",
            icon: <Car size={20} className="text-blue-500" />,
            bg: "bg-blue-100",
          },
          {
            title: "Active Vehicles",
            value: stats.active,
            subtitle: "Ready for lessons",
            color: "border-green-500",
            icon: <CheckCircle size={20} className="text-green-500" />,
            bg: "bg-green-100",
          },
          {
            title: "Inactive Vehicles",
            value: stats.inactive,
            subtitle: "Not in use",
            color: "border-yellow-500",
            icon: <Users size={20} className="text-yellow-500" />,
            bg: "bg-yellow-100",
          },
          {
            title: "Under Maintenance",
            value: stats.maintenance,
            subtitle: "Being serviced",
            color: "border-red-500",
            icon: <AlertTriangle size={20} className="text-red-500" />,
            bg: "bg-red-100",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={"p-6 rounded-2xl shadow-sm border border-white/40 bg-white/60 backdrop-blur-md"}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold text-gray-800">
                {stat.title}
              </span>
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${stat.bg} opacity-90`}
              >
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-gray-900">
                {stat.value}
              </div>
              <p className="text-sm font-medium text-gray-800">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-4 px-6 pb-10">
        {/* Recent Updates */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/40 flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={18} />
            <h2 className="font-bold text-gray-900">Recent Updates</h2>
          </div>
          <div className="p-6">
            {recentVehicles.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentVehicles.map((v) => (
                  <div
                    key={v._id}
                    className="p-3 rounded-md bg-white/40 hover:bg-white/60 transition border border-white/30"
                  >
                    <div className="flex justify_between items-center">
                      <div>
                        <h4 className="font-bold text-base text-gray-900">
                          {v.brand} {v.model}
                        </h4>
                        <p className="text-xs text-gray-800 font-mono">
                          {v.regNo}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(v.status)}>
                          {getStatusIcon(v.status)} {v.status}
                        </span>
                        <p className="text-xs text-gray-800 font-medium mt-1">
                          {new Date(v.updatedAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Car size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vehicles found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/40">
            <h2 className="font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid gap-3">
            {[
              { to: "/admin/vehicles", icon: <Car size={18} />, text: "View All Vehicles" },
              { to: "/admin/vehicles/add", icon: <Plus size={18} />, text: "Add New Vehicle" },
              { to: "/admin/vehicles?status=Active", icon: <CheckCircle size={18} />, text: "View Active Vehicles" },
              { to: "/admin/vehicles?status=Maintenance", icon: <AlertTriangle size={18} />, text: "Vehicles in Maintenance" },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-md border border-white/40 bg-white/40 backdrop-blur-sm text-gray-900 hover:bg-white/60 hover:border-white/50 hover:text-orange-700 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded bg-white/80 text-gray-700 group-hover:bg-orange-500 group-hover:text-white transition">
                  {action.icon}
                </div>
                <span className="text-sm font-semibold">{action.text}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Reminders */}
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden md:col-span-2">
          <div className="px-6 py-4 border-b border-white/40 flex items-center gap-2">
            <Calendar className="text-orange-500" size={18} />
            <h2 className="font-bold text-gray-900">Service Reminders</h2>
          </div>
          <div className="p-6">
            {vehicles.filter((v) => v.nextServiceDue).length > 0 ? (
              <div className="flex flex-col gap-3">
                {vehicles
                  .filter((v) => v.nextServiceDue)
                  .sort(
                    (a, b) =>
                      new Date(a.nextServiceDue) - new Date(b.nextServiceDue)
                  )
                  .slice(0, 5)
                  .map((v) => {
                    const dueDate = new Date(v.nextServiceDue);
                    const today = new Date();
                    const daysUntilDue = Math.ceil(
                      (dueDate - today) / (1000 * 60 * 60 * 24)
                    );
                    const isOverdue = daysUntilDue < 0;
                    const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

                    return (
                      <div
                        key={v._id}
                        className={`flex justify-between items-center p-3 rounded-md border ${
                          isOverdue
                            ? "bg-red-100/70 border-red-300"
                            : isDueSoon
                            ? "bg-yellow-100/70 border-yellow-300"
                            : "bg-white/40 border-white/30"
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-base text-gray-900">
                            {v.brand} {v.model}
                          </h4>
                          <p className="text-xs text-gray-700 font-mono">
                            {v.regNo}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-semibold block ${
                              isOverdue
                                ? "text-red-800"
                                : isDueSoon
                                ? "text-yellow-800"
                                : "text-blue-800"
                            }`}
                          >
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysUntilDue)} days`
                              : isDueSoon
                              ? `Due in ${daysUntilDue} days`
                              : `Due ${dueDate.toLocaleDateString()}`}
                          </span>
                          <Link
                            to={`/vehicles/${v._id}`}
                            className="text-xs text-orange-500 hover:underline"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No service reminders scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDashboard;
