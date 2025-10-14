// src/pages/Admin/AdminInquiries.jsx
import React from "react";

export default function AdminInquiries() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-700">View and manage incoming inquiries.</p>
      </div>
      <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-md p-4">
        <p className="text-gray-700">No inquiries to display.</p>
      </div>
    </div>
  );
}
