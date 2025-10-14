import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateInquiryForm } from "../../validation/inquiryValidation";

const InquiryForm = ({ item, users, onSubmit, onCancel, loading, hideCancel = false, studentInfo = null }) => {
  const [form, setForm] = useState({ userId: "", subject: "", message: "" });
  const [userKey, setUserKey] = useState("");
  const [errors, setErrors] = useState({});
  const [resolvedUserName, setResolvedUserName] = useState("");
  const [userLookupStatus, setUserLookupStatus] = useState("idle");

  const navigate = useNavigate();

  useEffect(() => {
    if (item) {
      setForm({
        userId: item.userId?._id || "",
        subject: item.subject || "",
        message: item.message || "",
      });
      setUserKey(item.userId?._id || "");
    } else if (studentInfo) {
      // Auto-fill for student inquiry
      // Use userMongoId (MongoDB ObjectId) for the inquiry, but display studentId
      const userMongoId = studentInfo.userMongoId || "";
      const displayId = studentInfo.studentId || "";
      setForm({ userId: userMongoId, subject: "", message: "" });
      setUserKey(displayId); // Display the student ID (e.g., S001)
      setResolvedUserName(studentInfo.full_name || studentInfo.name || "");
      setUserLookupStatus("resolved");
    } else {
      setForm({ userId: "", subject: "", message: "" });
      setUserKey("");
    }
  }, [item, studentInfo]);

  const userOptions = useMemo(() => users || [], [users]);

  const displayUserName = (u) => {
    if (!u) return "User";
    if (u.name && u.name.trim()) return u.name;
    if (u.fullName && u.fullName.trim()) return u.fullName;
    if (u.username && u.username.trim()) return u.username;
    if (u.email && typeof u.email === "string") {
      const local = u.email.split("@")[0];
      return local || u._id || "User";
    }
    return u._id || "User";
  };

  const handleUserKeyChange = (val) => {
    setUserKey(val.trim());
    setErrors((prev) => ({ ...prev, userId: "" }));
    setUserLookupStatus("resolving");
  };

  const isValidObjectId = (val) => /^[a-fA-F0-9]{24}$/.test(val);

  const validate = () => {
    const e = validateInquiryForm(form);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      userId: form.userId,
      subject: form.subject.trim(),
      message: form.message.trim(),
    };
    onSubmit(payload);
  };

  return (
    <div className="form-container" style={{ position: "relative" }}>
      {/* 🔹 Back button INSIDE header */}
      <div
        style={{
          position: "absolute",
          top: "25px",
          right: "40px",
          zIndex: "10",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/student")}
          style={{
            backgroundColor: "#F47C20",
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2D74C4")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F47C20")}
        >
          Back
        </button>
      </div>

      {/* 🔹 Form */}
      <div className="form-content" style={{ padding: "40px" }}>
        <h2 className="form-title">{item ? "Edit Inquiry" : "Create Inquiry"}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>User ID or Code *</label>
            <input
              type="text"
              placeholder="Paste a user _id or code/email"
              className={`form-input ${userLookupStatus === "not_found" ? "error" : ""}`}
              value={userKey}
              onChange={(e) => handleUserKeyChange(e.target.value)}
              readOnly={!!studentInfo}
              style={studentInfo ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" } : {}}
            />
            {userLookupStatus === "not_found" && errors.userId && (
              <p className="error-message">{errors.userId}</p>
            )}
          </div>

          <div className="form-group">
            <label>User Name (auto)</label>
            <input
              type="text"
              readOnly
              className="form-input"
              value={resolvedUserName}
              placeholder="Will auto-fill after User ID"
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              className={`form-input ${errors.subject ? "error" : ""}`}
              type="text"
              value={form.subject}
              maxLength={150}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="Subject"
            />
            {errors.subject && <p className="error-message">{errors.subject}</p>}
          </div>

          <div className="form-group full-width">
            <label>Message *</label>
            <textarea
              className={`form-textarea ${errors.message ? "error" : ""}`}
              rows={4}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Describe the inquiry..."
            />
            {errors.message && <p className="error-message">{errors.message}</p>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {item ? "Update Inquiry" : "Create Inquiry"}
          </button>
          {!hideCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
