import React, { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import InquiryForm from "./InquiryForm";
import { create as createInquiry } from "../../services/inquiryAPI";

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
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="dashboard-title">Inquiries</h1>
            <p className="dashboard-subtitle">Submit your inquiry</p>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="dashboard-content">
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
  );
};

export default StudentInquiry;
