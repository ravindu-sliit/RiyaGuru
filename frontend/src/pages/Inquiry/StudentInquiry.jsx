import React, { useState } from "react";
import { CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import InquiryForm from "./InquiryForm";
import { create as createInquiry } from "../../services/inquiryAPI";
import ProgressHero from "../../components/ProgressHero";

const StudentInquiry = () => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      await createInquiry(payload);
      showNotification("Inquiry submitted successfully");
    } catch (err) {
      showNotification(err?.message || "Failed to submit inquiry", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <ProgressHero
          title="Inquiries"
          subtitle="Submit your inquiry"
          icon={<BookOpen className="w-8 h-8 text-white" />}
        />
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <InquiryForm
            item={null}
            users={[]}
            onSubmit={handleSubmit}
            onCancel={() => { /* no list for students */ }}
            hideCancel
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentInquiry;
