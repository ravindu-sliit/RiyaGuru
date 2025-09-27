import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

const InquiryList = ({
  items,
  loading,
  onView,
  onEdit,
  onDelete,
  sortDir = "desc",
  onToggleSort = () => {},
}) => {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const displayUser = (u) => {
    if (!u) return "-";
    const name =
      u.name ||
      u.full_name ||
      u.fullName ||
      u.username ||
      (u.email ? u.email.split("@")[0] : "") ||
      u.userId ||
      u._id ||
      "-";
    return name;
  };

  if (loading) {
    return (
      <div className="maintenance-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading inquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-list-container">
      {!items || items.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">No inquiries found</h3>
          <p className="empty-state-description">Create your first inquiry.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>User</th>
                <th>Status</th>
                <th>
                  {/* Styled sort button so it looks like a header */}
                  <button
                    type="button"
                    onClick={onToggleSort}
                    title={`Sort by date (${
                      sortDir === "asc" ? "oldest" : "newest"
                    } first)`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      fontWeight: "600",
                      color: "#2D74C4", // 🔹 make it stand out (blue)
                    }}
                  >
                    Created {sortDir === "asc" ? "▲" : "▼"}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q._id} className="table-row">
                  <td>{q.subject}</td>
                  <td>
                    {displayUser(
                      typeof q.userId === "object" ? q.userId : q.resolvedUser
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        q.status === "Resolved"
                          ? "badge-success"
                          : q.status === "In Progress"
                          ? "badge-info"
                          : "badge-pending"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td>{formatDate(q.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View"
                        onClick={() => onView(q)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => onEdit(q)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => onDelete(q._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InquiryList;
