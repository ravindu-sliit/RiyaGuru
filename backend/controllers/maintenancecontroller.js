import Maintenance from "../models/Maintenance.js";

// ➕ Create Maintenance Record
export const createMaintenance = async (req, res) => {
  try {
    const maintenance = new Maintenance(req.body);
    const saved = await maintenance.save();
    const populated = await saved.populate(
      "vehicleId",
      "_id regNo model type fuelType year"
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📋 Get all Maintenance Records
export const getAllMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("vehicleId", "_id regNo model type fuelType year")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔍 Get Maintenance by ID
export const getMaintenanceById = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate(
      "vehicleId",
      "_id regNo model type fuelType year"
    );

    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Maintenance record not found" });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✏️ Update Maintenance
export const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("vehicleId", "_id regNo model type fuelType year");

    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Maintenance record not found" });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ❌ Delete Maintenance
export const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Maintenance record not found" });

    res
      .status(200)
      .json({ success: true, message: "Maintenance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
