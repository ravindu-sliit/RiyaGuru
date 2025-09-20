import * as vehicleService from "../services/vehicleService.js";

// ✅ Create vehicle
export const createVehicle = async (req, res) => {
  try {
    // Handle uploaded image
    const image = req.file ? `/uploads/vehicles/${req.file.filename}` : null;

    const vehicleData = {
      ...req.body,
      image,
    };

    const vehicle = await vehicleService.createVehicle(vehicleData);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all vehicles
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const image = req.file ? `/uploads/vehicles/${req.file.filename}` : undefined;

    const updateData = {
      ...req.body,
      ...(image && { image }), // only update if new image is uploaded
    };

    const updated = await vehicleService.updateVehicle(req.params.id, updateData);
    if (!updated) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle updated successfully", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const deleted = await vehicleService.deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get available vehicles by date & time
export const getAvailableVehicles = async (req, res) => {
  try {
    const { date, time } = req.query;
    const available = await vehicleService.getAvailableVehicles(date, time);
    res.json(available);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get vehicles by status
export const getVehiclesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Active", "Not-Active", "Maintenance"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vehicles = await vehicleService.getVehiclesByStatus(status);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
