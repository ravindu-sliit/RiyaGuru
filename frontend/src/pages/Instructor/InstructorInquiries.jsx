// src/pages/Instructor/InstructorInquiries.jsx
import React from "react";

export default function InstructorInquiries() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-700">Instructor view of student inquiries.</p>
      </div>
      <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-md p-4">
        <p className="text-gray-700">No inquiries assigned.</p>
      </div>
    </div>
  );
}
