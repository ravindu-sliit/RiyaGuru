import React from "react";
import { Link } from "react-router-dom";
import { Users, Car, ClipboardList, CreditCard, Layers } from "lucide-react";

const Card = ({ to, title, desc, icon: Icon, color }) => (
  <Link
    to={to}
    className="group rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all p-5 flex items-start gap-4"
  >
    <div
      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="font-semibold text-gray-900 group-hover:text-gray-950">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{desc}</div>
    </div>
    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">•</div>
  </Link>
);

const AdminQuickActions = () => {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card to="/admin/students" title="Students" desc="View and manage students" icon={Users} color="#2563EB" />
        <Card to="/vehicles" title="Vehicles" desc="Manage vehicles" icon={Car} color="#F59E0B" />
        <Card to="/instructors/list" title="Instructors" desc="Manage instructors" icon={ClipboardList} color="#10B981" />
        <Card to="/admin-payments" title="Payments" desc="Oversee transactions" icon={CreditCard} color="#EF4444" />
        <Card to="/admin-installments" title="Installments" desc="Approve plans" icon={Layers} color="#8B5CF6" />
      </div>
    </div>
  );
};

export default AdminQuickActions;
