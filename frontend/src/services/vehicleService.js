import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Vehicle API calls
export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async () => {
    try {
      const response = await api.get('/vehicles');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const formData = new FormData();
      
      // Append all vehicle data to FormData
      Object.keys(vehicleData).forEach(key => {
        if (key === 'image' && vehicleData[key] instanceof File) {
          formData.append('image', vehicleData[key]);
        } else {
          formData.append(key, vehicleData[key]);
        }
      });

      const response = await api.post('/vehicles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const formData = new FormData();
      
      // Append all vehicle data to FormData
      Object.keys(vehicleData).forEach(key => {
        if (key === 'image' && vehicleData[key] instanceof File) {
          formData.append('image', vehicleData[key]);
        } else if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
          formData.append(key, vehicleData[key]);
        }
      });

      const response = await api.put(`/vehicles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vehicles by status
  getVehiclesByStatus: async (status) => {
    try {
      const response = await api.get(`/vehicles/status/${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available vehicles
  getAvailableVehicles: async (date, time) => {
    try {
      const params = {};
      if (date) params.date = date;
      if (time) params.time = time;
      
      const response = await api.get('/vehicles/availability/check', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default vehicleService;