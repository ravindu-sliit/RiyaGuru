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
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMaintenanceRecords();
    // Defer loading vehicles until user opens the form; avoids noisy toast on first load
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Derived list filtered by search
  const filteredRecords = React.useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return maintenanceRecords;
    return maintenanceRecords.filter((r) => {
      const id = String(r?.vehicleId?._id || "").toLowerCase();
      const reg = String(r?.vehicleId?.regNumber || "").toLowerCase();
      const model = String(r?.vehicleId?.model || "").toLowerCase();
      return id.includes(q) || reg.includes(q) || model.includes(q);
    });
  }, [maintenanceRecords, search]);

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
      // Fail silently and keep vehicles as empty array; user can still open the form
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
        setMaintenanceRecords((prev) => prev.map((r) => (r._id === selectedRecord._id ? updated : r)));
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="dashboard-title">Vehicle Maintenance</h1>
            <p className="dashboard-subtitle">Manage vehicle maintenance records</p>
          </div>
          {activeView === "list" && (
            <div className="header-actions">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input header-search"
                placeholder="Search by Vehicle ID / Reg / Model"
              />
              <button onClick={handleCreate} className="btn btn-primary add-btn">
                <Plus size={20} />
                Add Maintenance
              </button>
            </div>
          )}
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
          <MaintenanceList
            records={filteredRecords}
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
    </div>
  );
};

export default MaintenanceDashboard;
