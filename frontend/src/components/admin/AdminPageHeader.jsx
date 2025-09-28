import React from "react";
import { useNavigate } from "react-router-dom";

/*
  Reusable admin page header with orange gradient bar, back button, icon, title and subtitle.
  Usage:
    <AdminPageHeader
      icon={<Calendar className="w-6 h-6 text-white" />}
      title="Booking Management"
      subtitle="Monitor and manage all driving lesson bookings"
      actions={<button>...</button>}
    />
*/

const AdminPageHeader = ({ icon, title, subtitle, actions, onBack }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all font-medium"
            >
              <span className="inline-block">←</span>
              Back
            </button>

            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-orange-100">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
