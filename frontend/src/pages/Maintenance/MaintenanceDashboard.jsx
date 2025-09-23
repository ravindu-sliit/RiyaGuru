import React, { useEffect, useState } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import MaintenanceList from "./MaintenanceList";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceView from "./MaintenanceView";

import {
  getAllMaintenance,
  getVehicles,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../../services/maintenanceAPI";

const MaintenanceDashboard = () => {
  const [activeView, setActiveView] = useState("list");
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const records = await getAllMaintenance();
      setMaintenanceRecords(records);
    } catch (err) {
      showNotification("Error loading maintenance records", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const list = await getVehicles();
      setVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Failed to load vehicles:", err?.message || err);
      setVehicles([]);
    }
  };

  const handleCreate = async () => {
    setSelectedRecord(null);
    if (vehicles.length === 0) await loadVehicles();
    setActiveView("form");
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setActiveView("view");
  };

  const handleEdit = async (record) => {
    setSelectedRecord(record);
    if (vehicles.length === 0) await loadVehicles();
    setActiveView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance record?")) return;
    try {
      await deleteMaintenance(id);
      setMaintenanceRecords((prev) => prev.filter((r) => r._id !== id));
      showNotification("Maintenance record deleted");
    } catch (err) {
      showNotification("Error deleting maintenance record", "error");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (selectedRecord) {
        const updated = await updateMaintenance(selectedRecord._id, formData);
        setMaintenanceRecords((prev) =>
          prev.map((r) => (r._id === selectedRecord._id ? updated : r))
        );
        showNotification("Maintenance updated");
      } else {
        const created = await createMaintenance(formData);
        setMaintenanceRecords((prev) => [...prev, created]);
        showNotification("Maintenance created");
      }
      setActiveView("list");
    } catch (err) {
      showNotification(err.message || "Error saving record", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ PDF Download Handler
  const handleDownloadPDF = () => {
    window.open("http://localhost:5000/api/reports/maintenance/pdf", "_blank");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="dashboard-title">Vehicle Maintenance</h1>
            <p className="dashboard-subtitle">
              Manage vehicle maintenance records
            </p>
          </div>
          {activeView === "list" && (
            <button onClick={handleCreate} className="btn btn-primary add-btn">
              <Plus size={20} />
              Add Maintenance
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      {/* Content */}
      <div className="dashboard-content">
        {activeView === "list" && (
          <MaintenanceList
            records={maintenanceRecords}
            loading={loading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}

        {activeView === "form" && (
          <MaintenanceForm
            record={selectedRecord}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            onCancel={() => setActiveView("list")}
            loading={loading}
          />
        )}

        {activeView === "view" && selectedRecord && (
          <MaintenanceView
            record={selectedRecord}
            onEdit={() => handleEdit(selectedRecord)}
            onBack={() => setActiveView("list")}
          />
        )}
      </div>

      {/* ✅ Floating Download Button */}
      {activeView === "list" && (
        <button
          onClick={handleDownloadPDF}
          className="btn btn-secondary floating-btn"
        >
          Download Report
        </button>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
