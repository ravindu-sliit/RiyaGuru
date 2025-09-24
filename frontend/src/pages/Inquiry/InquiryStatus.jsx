import React, { useEffect, useState } from "react";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];

const InquiryStatus = ({ item, loading, onSubmit, onCancel }) => {
  const [status, setStatus] = useState(item?.status || "Pending");

  useEffect(() => {
    setStatus(item?.status || "Pending");
  }, [item]);

  const handleSave = () => {
    onSubmit({ status });
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Update Inquiry Status</h2>
      </div>
      <div className="form-content">
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Subject</label>
            <input className="form-input" type="text" readOnly value={item?.subject || ""} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" readOnly rows={4} value={item?.message || ""} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>Save</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InquiryStatus;
