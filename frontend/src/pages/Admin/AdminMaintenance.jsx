// src/pages/Admin/AdminMaintenance.jsx
import React from "react";

export default function AdminMaintenance() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        <p className="text-gray-700">Track system or vehicle maintenance tasks.</p>
      </div>
      <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-md p-4">
        <p className="text-gray-700">No maintenance records yet.</p>
      </div>
    </div>
  );
}
