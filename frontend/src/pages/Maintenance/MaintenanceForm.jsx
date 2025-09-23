import React, { useEffect, useState } from "react";

const MaintenanceForm = ({ record, vehicles, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceDate: "",
    serviceType: "",
    cost: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Helper: today's date in YYYY-MM-DD (local time)
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayStr = getTodayStr();

  useEffect(() => {
    if (record) {
      setFormData({
        vehicleId: record.vehicleId?._id || "",
        serviceDate: record.serviceDate?.split("T")[0] || "",
        serviceType: record.serviceType || "",
        cost: record.cost?.toString() || "",
        description: record.description || "",
      });
    } else {
      setFormData({ vehicleId: "", serviceDate: "", serviceType: "", cost: "", description: "" });
    }
  }, [record]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicleId) newErrors.vehicleId = "Vehicle is required";
    if (!formData.serviceDate) {
      newErrors.serviceDate = "Service date is required";
    } else {
      // Disallow past dates (today allowed)
      const selected = new Date(formData.serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.serviceDate = "Service date cannot be in the past";
      }
    }
    if (!formData.serviceType || formData.serviceType.trim().length < 2) newErrors.serviceType = "Service type is required";
    const costVal = parseFloat(formData.cost);
    if (isNaN(costVal) || costVal < 0) newErrors.cost = "Valid cost is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit({
      ...formData,
      cost: parseFloat(formData.cost),
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">{record ? "Edit Maintenance Record" : "Create Maintenance Record"}</h2>
      </div>

      <div className="form-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => handleInputChange("vehicleId", e.target.value)}
              className={`form-input ${errors.vehicleId ? "error" : ""}`}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.regNumber} - {v.model}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="error-message">{errors.vehicleId}</p>}
          </div>

          {formData.vehicleId && (
            <div className="form-group">
              <label className="form-label">Vehicle ID</label>
              <input type="text" value={formData.vehicleId} readOnly className="form-input" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Service Date *</label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => handleInputChange("serviceDate", e.target.value)}
              min={todayStr}
              className={`form-input ${errors.serviceDate ? "error" : ""}`}
            />
            {errors.serviceDate && <p className="error-message">{errors.serviceDate}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Service Type *</label>
            <input
              type="text"
              value={formData.serviceType}
              onChange={(e) => handleInputChange("serviceType", e.target.value)}
              maxLength={100}
              placeholder="e.g., Oil Change, Brake Service"
              className={`form-input ${errors.serviceType ? "error" : ""}`}
            />
            {errors.serviceType && <p className="error-message">{errors.serviceType}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Cost (LKR) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => handleInputChange("cost", e.target.value)}
              className={`form-input ${errors.cost ? "error" : ""}`}
            />
            {errors.cost && <p className="error-message">{errors.cost}</p>}
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="form-textarea"
            placeholder="Additional details about the maintenance service..."
            maxLength={1000}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {record ? "Update Record" : "Create Record"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;
