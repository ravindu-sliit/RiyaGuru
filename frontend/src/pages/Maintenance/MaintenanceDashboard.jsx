import React, { useEffect, useState } from "react";
import { Plus, FileDown, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

import { API_BASE } from "../../services/api";

const MaintenanceDashboard = () => {
  const [activeView, setActiveView] = useState("list");
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredRecords = React.useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return maintenanceRecords;
    return maintenanceRecords.filter((r) => {
      const id = String(r?.vehicleId?._id || "").toLowerCase();
      const reg = String(r?.vehicleId?.regNo ?? "").toLowerCase(); // ✅ FIXED
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

  const handleGeneratePDF = async () => {
    try {
      const token = localStorage.getItem("rg_token") || "";

      const res = await fetch(`${API_BASE}/api/maintenance/pdf`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to generate PDF");
      }

      const blob = await res.blob();

      let filename = "Maintenance_Report.pdf";
      const cd = res.headers.get("Content-Disposition");
      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/i);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification("PDF downloaded");
    } catch (err) {
      showNotification(err.message || "Error generating PDF", "error");
    }
  };

  return (
    <div className="dashboard">
      {/* 🔹 Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1 className="dashboard-title">Vehicle Maintenance</h1>
            <p className="dashboard-subtitle">
              Manage vehicle maintenance records
            </p>
          </div>
          <div className="header-actions">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input header-search"
              placeholder="Search by Vehicle ID / Reg / Model"
            />
            <button
              onClick={handleCreate}
              className="btn btn-primary add-btn"
              style={{ backgroundColor: "#F47C20", color: "#FFFFFF" }}
            >
              <Plus size={20} />
              Add Maintenance
            </button>
            <button
              onClick={handleGeneratePDF}
              className="btn btn-secondary export-btn"
              style={{ backgroundColor: "#2D74C4", color: "#FFFFFF" }}
            >
              <FileDown size={20} />
              Generate PDF
            </button>
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

        {/* 🔹 Back Button directly under table */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/home/admin")}
            className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md font-semibold transition-all duration-300"
            style={{
              backgroundColor: "#F47C20",
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
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
