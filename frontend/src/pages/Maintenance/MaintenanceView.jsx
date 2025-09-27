import React from "react";
import { Edit, Car, Calendar, DollarSign, FileText } from "lucide-react";

const MaintenanceView = ({ record, onEdit, onBack }) => {
  if (!record) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount || 0);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="view-container">
      <div className="view-header">
        <h2 className="view-title">Maintenance Record Details</h2>
        <div className="view-actions">
          <button onClick={onEdit} className="btn btn-warning">
            <Edit size={16} />
            Edit
          </button>
          <button onClick={onBack} className="btn btn-secondary">Back to List</button>
        </div>
      </div>

      <div className="view-content">
        <div className="info-grid">
          {/* Vehicle Information */}
          <div className="info-card">
            <h3 className="info-card-title">
              <Car size={20} className="info-icon vehicle-icon" />
              Vehicle Information
            </h3>
            <div className="info-details">
              <div className="info-item">
                <span className="info-label">Vehicle ID</span>
                <p className="info-value">{record.vehicleId?._id}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Registration Number</span>
                <p className="info-value primary">{record.vehicleId?.regNo || "N/A"}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Model</span>
                <p className="info-value">{record.vehicleId?.model || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="info-card">
            <h3 className="info-card-title">
              <Calendar size={20} className="info-icon service-icon" />
              Service Information
            </h3>
            <div className="info-details">
              <div className="info-item">
                <span className="info-label">Service Date</span>
                <p className="info-value">{formatDate(record.serviceDate)}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Service Type</span>
                <p className="info-value">{record.serviceType}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Cost</span>
                <p className="info-value cost">
                  <DollarSign size={20} /> {formatCurrency(record.cost)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {record.description && (
          <div className="description-section">
            <h3 className="section-title">
              <FileText size={20} className="info-icon description-icon" /> Description
            </h3>
            <div className="description-content">
              <p className="description-text">{record.description}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="metadata-section">
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Created:</span> {formatDateTime(record.createdAt)}
            </div>
            {record.updatedAt && record.updatedAt !== record.createdAt && (
              <div className="metadata-item">
                <span className="metadata-label">Last Updated:</span> {formatDateTime(record.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceView;
