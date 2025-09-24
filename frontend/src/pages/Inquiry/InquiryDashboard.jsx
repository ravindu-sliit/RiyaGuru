import React, { useEffect, useState } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import InquiryList from "./InquiryList";
import InquiryForm from "./InquiryForm";
import InquiryStatus from "./InquiryStatus";
import InquiryView from "./InquiryView";
import { getAll as getAllInquiries, create as createInquiry, update as updateInquiry, remove as deleteInquiry } from "../../services/inquiryAPI";

// Local helper to fetch users for the dropdown (keeps changes scoped to Inquiry pages)
// Supports multiple response shapes from the existing backend without changing it.
const fetchUsers = async () => {
  const res = await fetch("/api/users");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  // Accept shapes: [{...}], { data: [...] }, { users: [...] }
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.users)
    ? data.users
    : [];
  return list;
};

const InquiryDashboard = () => {
  const [activeView, setActiveView] = useState("list");
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadInquiries();
    // Users are loaded lazily when form opens
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Admin-only: update status/progress/resolved state
  const handleStatusSubmit = async (payload) => {
    try {
      if (!selected?._id) return;
      setLoading(true);
      await updateInquiry(selected._id, payload);
      showNotification("Inquiry status updated");
      // refresh and go back to view to see the updated status
      await loadInquiries();
      // find the updated item to display in view
      const updated = (prev => prev)(null); // noop to keep linter calm
      setSelected((cur) => {
        const found = (inquiries || []).find((x) => x._id === selected._id);
        return found || cur;
      });
      setActiveView("list");
    } catch (err) {
      showNotification(err?.message || "Error updating status", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const list = await getAllInquiries();
      const items = Array.isArray(list) ? list : [];

      // Post-process to resolve names for legacy records where userId wasn't populated
      const needsResolve = items.some((it) => !it.userId || typeof it.userId === "string");
      if (needsResolve) {
        // fetch users and students once
        let usersArr = [];
        let studentsArr = [];
        try {
          const uRes = await fetch("/api/users");
          const uData = await uRes.json().catch(() => ({}));
          usersArr = Array.isArray(uData) ? uData : uData.users || uData.data || [];
        } catch {}
        try {
          const sRes = await fetch("/api/students");
          const sData = await sRes.json().catch(() => ({}));
          studentsArr = Array.isArray(sData) ? sData : sData.students || sData.data || [];
        } catch {}

        const byUserId = new Map(usersArr.map((u) => [u._id, u]));
        const byCode = new Map(usersArr.map((u) => [String(u.userId || u.code || "").toLowerCase(), u]));
        const byEmailUser = new Map(usersArr.map((u) => [String(u.email || "").toLowerCase(), u]));
        const byStudentId = new Map(studentsArr.map((s) => [String(s.studentId || "").toLowerCase(), s]));
        const byStudentEmail = new Map(studentsArr.map((s) => [String(s.email || "").toLowerCase(), s]));

        const isObjectId = (val) => /^[a-fA-F0-9]{24}$/.test(String(val || ""));
        const fetchUserById = async (id) => {
          try {
            const r = await fetch(`/api/users/${id}`);
            const j = await r.json().catch(() => ({}));
            if (!r.ok) return null;
            return j?.user || j?.data || j;
          } catch {
            return null;
          }
        };

        const enriched = await Promise.all(items.map(async (it) => {
          if (it.userId && typeof it.userId === "object") return it; // already populated
          const key = String(it.userId || "").trim();
          if (!key) return it;
          // Try via user collections
          const uById = byUserId.get(key);
          if (uById) return { ...it, resolvedUser: uById };
          const lower = key.toLowerCase();
          const uByCode = byCode.get(lower);
          if (uByCode) return { ...it, resolvedUser: uByCode };
          const uByEmail = byEmailUser.get(lower);
          if (uByEmail) return { ...it, resolvedUser: uByEmail };
          // Try via student then link by userId/email
          const s = byStudentId.get(lower) || byStudentEmail.get(lower);
          if (s) {
            const uByUserId = byCode.get(String(s.studentId || "").toLowerCase());
            const uByEmail2 = byEmailUser.get(String(s.email || "").toLowerCase());
            const resolved = uByUserId || uByEmail2;
            if (resolved) return { ...it, resolvedUser: resolved };
          }
          // As a last resort, if key is an ObjectId, fetch single user
          if (isObjectId(key)) {
            const fetched = await fetchUserById(key);
            if (fetched) return { ...it, resolvedUser: fetched };
          }
          return it;
        }));
        setInquiries(enriched);
      } else {
        setInquiries(items);
      }
    } catch (err) {
      showNotification("Error loading inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  const ensureUsersLoaded = async () => {
    if (users.length) return;
    try {
      const u = await fetchUsers();
      setUsers(u);
      if (!u || u.length === 0) {
        setTimeout(() => {}, 0); // no-op to keep flow
        // Surface a subtle notification so the user knows why the dropdown is empty
        setNotification({ message: "No users found. Please add users first.", type: "error" });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to load users for inquiry:", err?.message || err);
      setUsers([]);
      setNotification({ message: "Error loading users", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCreate = async () => {
    setSelected(null);
    await ensureUsersLoaded();
    setActiveView("form");
  };

  const handleEdit = async (item) => {
    setSelected(item);
    // Admin edits are status-only; no need to load users
    setActiveView("status");
  };

  const handleView = (item) => {
    setSelected(item);
    setActiveView("view");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      setInquiries((prev) => prev.filter((x) => x._id !== id));
      showNotification("Inquiry deleted");
    } catch (err) {
      showNotification("Error deleting inquiry", "error");
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      setLoading(true);
      if (selected) {
        const updated = await updateInquiry(selected._id, payload);
        showNotification("Inquiry updated");
        // Switch view first so user doesn't see a blank panel
        setActiveView("list");
        await loadInquiries();
      } else {
        const created = await createInquiry(payload);
        showNotification("Inquiry created");
        // Switch view first so user doesn't see a blank panel
        setActiveView("list");
        await loadInquiries();
      }
    } catch (err) {
      showNotification(err?.message || "Error saving inquiry", "error");
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
            <p className="dashboard-subtitle">Manage and respond to user inquiries</p>
          </div>
          {/* Admin view: no create button */}
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <div className="dashboard-content">
        {activeView === "list" && (
          <InquiryList
            items={inquiries}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeView === "form" && (
          <InquiryForm
            item={selected}
            users={users}
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView("list")}
            loading={loading}
          />
        )}

        {activeView === "view" && selected && (
          <InquiryView item={selected} onEdit={() => handleEdit(selected)} onBack={() => setActiveView("list")} />)
        }

        {activeView === "status" && selected && (
          <InquiryStatus item={selected} loading={loading} onSubmit={handleStatusSubmit} onCancel={() => setActiveView("view")} />
        )}
      </div>
    </div>
  );
};

export default InquiryDashboard;
