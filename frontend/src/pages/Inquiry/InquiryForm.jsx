import React, { useEffect, useMemo, useState } from "react";
import { validateInquiryForm } from "../../validation/inquiryValidation"; // Import central validator

// statuses removed: form collects only userId, subject, message

const InquiryForm = ({ item, users, onSubmit, onCancel, loading, hideCancel = false }) => {
  const [form, setForm] = useState({ userId: "", subject: "", message: "" });
  const [userKey, setUserKey] = useState(""); // what the user types (ObjectId or code/email)
  const [errors, setErrors] = useState({});
  const [resolvedUserName, setResolvedUserName] = useState("");
  const [userLookupStatus, setUserLookupStatus] = useState("idle"); // idle | resolving | resolved | not_found

  useEffect(() => {
    if (item) {
      setForm({
        userId: item.userId?._id || "",
        subject: item.subject || "",
        message: item.message || "",
      });
      setUserKey(item.userId?._id || "");
    } else {
      setForm({ userId: "", subject: "", message: "" });
      setUserKey("");
    }
  }, [item]);

  const userOptions = useMemo(() => users || [], [users]);

  // Prefer real name; fall back to username part of email; fall back to id
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

  // Handle user key (ID/code/email) input edits
  const handleUserKeyChange = (val) => {
    setUserKey(val.trim());
    // clear any stale error while we attempt a new resolution
    setErrors((prev) => ({ ...prev, userId: "" }));
    setUserLookupStatus("resolving");
  };

  // Simple MongoDB ObjectId validation (24 hex chars)
  const isValidObjectId = (val) => /^[a-fA-F0-9]{24}$/.test(val);

  // ✅ Updated validate function using central validator
  const validate = () => {
    const e = validateInquiryForm(form); 
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // Lookup helpers
  const fetchAllUsers = async () => {
    const res = await fetch(`/api/users`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    const list = Array.isArray(data) ? data : data.data || data.users || [];
    return Array.isArray(list) ? list : [];
  };

  const fetchAllStudents = async () => {
    const res = await fetch(`/api/students`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    // Accept shapes: [{...}], { data: [...] }
    const list = Array.isArray(data) ? data : data.data || data.students || [];
    return Array.isArray(list) ? list : [];
  };

  const fetchStudentByCode = async (code) => {
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(code)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return null; // controller returns { message } on 404
      // shapes: { student } or { data }
      const student = data?.student || data?.data || data;
      return student && (student.studentId || student.email) ? student : null;
    } catch {
      return null;
    }
  };

  // Fetch a single user by ID if not found in preloaded users
  const fetchUserById = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      // Normalize potential shapes
      const user = data?.data || data?.user || data;
      return user && user._id ? user : null;
    } catch (e) {
      return null;
    }
  };

  // Resolve and show user name whenever userId changes (from dropdown or manual input)
  // Resolve the entered userKey to a real user _id and name
  useEffect(() => {
    let active = true;
    const run = async () => {
      setResolvedUserName("");
      setUserLookupStatus("resolving");
      if (!userKey) {
        setForm((p) => ({ ...p, userId: "" }));
        setUserLookupStatus("idle");
        return;
      }
      // If it's a valid ObjectId, prefer that directly
      if (isValidObjectId(userKey)) {
        // try local list first by _id
        const localId = userOptions.find((u) => u._id === userKey);
        if (localId) {
          active && setResolvedUserName(displayUserName(localId));
          active && setUserLookupStatus("resolved");
        } else {
          const fetched = await fetchUserById(userKey);
          if (active && fetched) {
            setResolvedUserName(displayUserName(fetched));
            setUserLookupStatus("resolved");
          } else if (active) {
            setResolvedUserName("");
            setErrors((prev) => ({ ...prev, userId: "User ID not found in database" }));
            setUserLookupStatus("not_found");
          }
        }
        active && setForm((p) => ({ ...p, userId: userKey }));
        return;
      }

      // Not an ObjectId: try resolving by common fields (code, email, username, name)
      let list = userOptions;
      if (!list || list.length === 0) {
        try { list = await fetchAllUsers(); } catch { list = []; }
      }
      const keyLower = String(userKey).trim().toLowerCase();
      let found = (list || []).find((u) => {
        const checks = [u.userId, u.code, u.email, u.username, u.name, u.fullName];
        return checks.some((v) => typeof v === "string" && v.trim().toLowerCase() === keyLower);
      });
      if (found) {
        active && setResolvedUserName(displayUserName(found));
        active && setForm((p) => ({ ...p, userId: found._id }));
        setErrors((prev) => ({ ...prev, userId: "" }));
        active && setUserLookupStatus("resolved");
      } else {
        // Try resolving as a Student ID or Student email
        let students = [];
        // If key looks like a student code (e.g., S052), try targeted fetch first
        const looksLikeStudentCode = /^s\d+$/i.test(String(userKey).trim());
        if (looksLikeStudentCode) {
          const one = await fetchStudentByCode(userKey.trim());
          if (one) students = [one];
        }
        if (students.length === 0) {
          try { students = await fetchAllStudents(); } catch { students = []; }
        }
        const sFound = (students || []).find((s) => {
          const checks = [s.studentId, s.email];
          return checks.some((v) => typeof v === "string" && v.trim().toLowerCase() === keyLower);
        });
        if (sFound) {
          // We have a student; try to find a matching user by email
          let users = list;
          if (!users || users.length === 0) {
            try { users = await fetchAllUsers(); } catch { users = []; }
          }
          // Prefer direct match by userId === studentId
          const userByUserId = (users || []).find((u) => typeof u.userId === "string" && u.userId.trim().toLowerCase() === String(sFound.studentId).trim().toLowerCase());
          const userByEmail = (users || []).find((u) => typeof u.email === "string" && u.email.trim().toLowerCase() === String(sFound.email).trim().toLowerCase());
          const resolvedUser = userByUserId || userByEmail || null;
          if (resolvedUser) {
            active && setResolvedUserName(displayUserName(resolvedUser));
            active && setForm((p) => ({ ...p, userId: resolvedUser._id }));
            setErrors((prev) => ({ ...prev, userId: "" }));
            active && setUserLookupStatus("resolved");
          } else {
            active && setForm((p) => ({ ...p, userId: "" }));
            setErrors((prev) => ({ ...prev, userId: "No user account linked to this student (matched by userId/email)." }));
            active && setUserLookupStatus("not_found");
          }
        } else {
          active && setForm((p) => ({ ...p, userId: "" }));
          setErrors((prev) => ({ ...prev, userId: "User not found. Enter a valid ObjectId, user code/email, or a studentId/email." }));
          active && setUserLookupStatus("not_found");
        }
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [userKey, userOptions]);

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { userId: form.userId, subject: form.subject.trim(), message: form.message.trim() };
    onSubmit(payload);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">{item ? "Edit Inquiry" : "Create Inquiry"}</h2>
      </div>
      <div className="form-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">User ID or Code *</label>
            {(() => {
              const showUserIdError = userLookupStatus === "not_found"; // only show when we definitively failed
              return (
                <>
                  <input
                    type="text"
                    placeholder="Paste a user _id or code/email"
                    className={`form-input ${showUserIdError ? "error" : ""}`}
                    value={userKey}
                    onChange={(e) => handleUserKeyChange(e.target.value)}
                  />
                  {showUserIdError && errors.userId && (
                    <p className="error-message">{errors.userId}</p>
                  )}
                </>
              );
            })()}
          </div>

          <div className="form-group">
            <label className="form-label">User Name (auto)</label>
            <input type="text" readOnly className="form-input" value={resolvedUserName} placeholder="Will auto-fill after User ID" />
          </div>

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input className={`form-input ${errors.subject ? "error" : ""}`} type="text" value={form.subject} maxLength={150} onChange={(e) => handleChange("subject", e.target.value)} placeholder="Subject" />
            {errors.subject && <p className="error-message">{errors.subject}</p>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Message *</label>
            <textarea className={`form-textarea ${errors.message ? "error" : ""}`} rows={4} value={form.message} onChange={(e) => handleChange("message", e.target.value)} placeholder="Describe the inquiry..." />
            {errors.message && <p className="error-message">{errors.message}</p>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{item ? "Update Inquiry" : "Create Inquiry"}</button>
          {!hideCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
