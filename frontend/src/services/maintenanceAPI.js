// src/services/maintenanceAPI.js - API Service for Maintenance Operations

// Use relative base URL so the CRA dev server proxy can forward to backend
const BASE_URL = "/api";

// Generic API call function with error handling
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // Try parse JSON (backend consistently returns JSON)
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Normalize common errors
    if (error.name === "TypeError" && /fetch/i.test(error.message)) {
      throw new Error("Network error: Unable to connect to server.");
    }
    throw error;
  }
};

// Maintenance API functions
export const maintenanceAPI = {
  // Get all maintenance records
  getAllMaintenance: async () => {
    const response = await apiCall("/maintenance");
    return response.data; // backend: { success, data }
  },

  // Get maintenance record by ID
  getMaintenanceById: async (id) => {
    const response = await apiCall(`/maintenance/${id}`);
    return response.data;
  },

  // Create new maintenance record
  createMaintenance: async (maintenanceData) => {
    const response = await apiCall("/maintenance", {
      method: "POST",
      body: JSON.stringify(maintenanceData),
    });
    return response.data;
  },

  // Update maintenance record
  updateMaintenance: async (id, maintenanceData) => {
    const response = await apiCall(`/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(maintenanceData),
    });
    return response.data;
  },

  // Delete maintenance record
  deleteMaintenance: async (id) => {
    const response = await apiCall(`/maintenance/${id}`, {
      method: "DELETE",
    });
    return response; // { success, message }
  },

  // Get vehicles for dropdown (backend returns plain array)
  getVehicles: async () => {
    const response = await apiCall("/vehicles");
    return response; // array of vehicles
  },
};

// Export individual functions for easier imports
export const {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getVehicles,
} = maintenanceAPI;

export default maintenanceAPI;
