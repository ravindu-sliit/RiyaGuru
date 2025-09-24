import React from "react";
import { Edit } from "lucide-react";

const InquiryView = ({ item, onEdit, onBack }) => {
  if (!item) return null;
  const formatDateTime = (d) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const displayUser = (u) => {
    if (!u) return "-";
    const name = u.name || u.full_name || u.fullName || u.username || (u.email ? u.email.split("@")[0] : "") || u.userId || u._id || "-";
    return name;
  };
  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Inquiry Details</h2>
        <div className="view-actions">
          <button onClick={onEdit} className="btn btn-warning"><Edit size={16} /> Edit</button>
          <button onClick={onBack} className="btn btn-secondary">Back to List</button>
        </div>
      </div>
      <div className="view-content">
        <div className="info-grid">
          <div className="info-card">
            <h3 className="info-card-title">Inquiry</h3>
            <div className="info-details">
              <div className="info-item"><span className="info-label">Subject</span><p className="info-value primary">{item.subject}</p></div>
              <div className="info-item"><span className="info-label">Message</span><p className="info-value">{item.message}</p></div>
            </div>
          </div>
          <div className="info-card">
            <h3 className="info-card-title">Meta</h3>
            <div className="info-details">
              <div className="info-item"><span className="info-label">Status</span><p className="info-value">{item.status}</p></div>
              <div className="info-item"><span className="info-label">User</span><p className="info-value">{displayUser(item.userId)}</p></div>
              <div className="info-item"><span className="info-label">Created</span><p className="info-value">{formatDateTime(item.createdAt)}</p></div>
              {item.updatedAt && <div className="info-item"><span className="info-label">Updated</span><p className="info-value">{formatDateTime(item.updatedAt)}</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryView;
