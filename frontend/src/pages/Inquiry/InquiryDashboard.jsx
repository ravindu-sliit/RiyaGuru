import React, { useEffect, useState } from "react";
import { Plus, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InquiryList from "./InquiryList";
import InquiryForm from "./InquiryForm";
import InquiryStatus from "./InquiryStatus";
import InquiryView from "./InquiryView";
import {
  getAll as getAllInquiries,
  create as createInquiry,
  update as updateInquiry,
  remove as deleteInquiry,
} from "../../services/inquiryAPI";

// Local helper to fetch users
const fetchUsers = async () => {
  const res = await fetch("/api/users");
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return Array.isArray(data)
    ? data
    : Array.isArray(data.data)
    ? data.data
    : Array.isArray(data.users)
    ? data.users
    : [];
};

const InquiryDashboard = () => {
  const [activeView, setActiveView] = useState("list");
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // 👇 NEW: sort state
  const [sortDir, setSortDir] = useState("desc");

  const navigate = useNavigate();

  useEffect(() => {
    loadInquiries();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const list = await getAllInquiries();

      // ✅ Normalize createdAt so sorting always works
      const normalized = (Array.isArray(list) ? list : []).map((x) => ({
        ...x,
        createdAt: x?.createdAt || x?.created || x?.date || x?.created_at || null,
      }));

      setInquiries(normalized);
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
        setNotification({
          message: "No users found. Please add users first.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to load users:", err?.message || err);
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

  const handleEdit = (item) => {
    setSelected(item);
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
        await updateInquiry(selected._id, payload);
        showNotification("Inquiry updated");
      } else {
        await createInquiry(payload);
        showNotification("Inquiry created");
      }
      setActiveView("list");
      await loadInquiries();
    } catch (err) {
      showNotification(err?.message || "Error saving inquiry", "error");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Memoized sorted inquiries
  const sortedInquiries = React.useMemo(() => {
    const arr = Array.isArray(inquiries) ? [...inquiries] : [];
    arr.sort((a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return arr;
  }, [inquiries, sortDir]);

  // 👇 Toggle function
  const toggleDateSort = () =>
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <div className="dashboard">
      {/* 🔹 Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="dashboard-title">Inquiries</h1>
            <p className="dashboard-subtitle">
              Manage and respond to user inquiries
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 Notifications */}
      {notification && (
        <div
          className={`notification ${notification.type}`}
          style={{
            backgroundColor:
              notification.type === "success" ? "#28A745" : "#DC3545",
            color: "#FFFFFF",
            padding: "10px",
            borderRadius: "6px",
            margin: "10px 0",
          }}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      {/* 🔹 Content */}
      <div className="dashboard-content">
        {activeView === "list" && (
          <>
            <InquiryList
              items={sortedInquiries} // ✅ sorted list
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortDir={sortDir} // ✅ pass sort direction
              onToggleSort={toggleDateSort} // ✅ pass toggle handler
            />

            {/* Back button under table aligned left */}
            <div className="mt-6 flex">
              <button
                onClick={() => navigate("/home/admin")}
                className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md font-semibold transition-all duration-300"
                style={{
                  backgroundColor: "#F47C20", // Orange
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2D74C4")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F47C20")
                }
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </>
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
          <InquiryView
            item={selected}
            onEdit={() => handleEdit(selected)}
            onBack={() => setActiveView("list")}
          />
        )}

        {activeView === "status" && selected && (
          <InquiryStatus
            item={selected}
            loading={loading}
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView("view")}
          />
        )}
      </div>
    </div>
  );
};

export default InquiryDashboard;
