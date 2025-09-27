import React from "react";
import { Edit, Trash2, Eye, Calendar, Car, DollarSign } from "lucide-react";

const MaintenanceList = ({ records, loading, onEdit, onView, onDelete }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="maintenance-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading maintenance records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-list-container">
      {records.length === 0 ? (
        <div className="empty-state">
          <Car size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No maintenance records found</h3>
          <p className="empty-state-description">
            Start by adding your first maintenance record.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Reg No</th>
                <th>Service Date</th>
                <th>Service Type</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="table-row">
                  {/* Vehicle Name + Model */}
                  <td>
                    <div className="vehicle-info">
                      <div className="vehicle-reg">{record.vehicleId?.regNo || "N/A"}</div>
                      <div className="vehicle-model">{record.vehicleId?.model || "N/A"}</div>
                    </div>
                  </td>

                  {/* Registration Number */}
                  <td>{record.vehicleId?.regNo || "N/A"}</td>

                  {/* Service Date */}
                  <td>
                    <div className="date-info">
                      <Calendar size={16} className="date-icon" />
                      {formatDate(record.serviceDate)}
                    </div>
                  </td>

                  {/* Service Type */}
                  <td className="service-type">{record.serviceType}</td>

                  {/* Cost */}
                  <td>
                    <div className="cost-info">
                      <DollarSign size={16} className="cost-icon" />
                      {formatCurrency(record.cost)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onView(record)}
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(record)}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(record._id)}
                        className="action-btn delete-btn"
                        title="Delete"
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

export default MaintenanceList;
