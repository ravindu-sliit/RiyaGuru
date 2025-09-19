// backend/services/vehicleService.js

import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

// ✅ Create vehicle
export const createVehicle = async (data) => {
  const vehicle = new Vehicle(data);
  return await vehicle.save();
};

// ✅ Get all vehicles
export const getVehicles = async () => {
  return await Vehicle.find().populate("assignedInstructor", "name email");
};

// ✅ Get vehicle by ID
export const getVehicleById = async (id) => {
  return await Vehicle.findById(id).populate("assignedInstructor", "name email");
};

// ✅ Update vehicle
export const updateVehicle = async (id, data) => {
  return await Vehicle.findByIdAndUpdate(id, data, { new: true });
};

// ✅ Delete vehicle
export const deleteVehicle = async (id) => {
  return await Vehicle.findByIdAndDelete(id);
};

// ✅ Get available vehicles (ignore status, only check date & time slots)
export const getAvailableVehicles = async (date, time) => {
  if (!date || !time) {
    // If no date/time → return all vehicles
    return await Vehicle.find();
  }

  // Find vehicles already booked at this date & time
  const booked = await Booking.find({ date, time }).select("vehicle");
  const bookedIds = booked.map((b) => b.vehicle.toString());

  // Return vehicles that are NOT booked
  return await Vehicle.find({
    _id: { $nin: bookedIds }
  });
};

// ✅ Get vehicles only by status
export const getVehiclesByStatus = async (status) => {
  if (!["available", "unavailable", "maintenance"].includes(status)) {
    throw new Error("Invalid status. Use available, unavailable, or maintenance.");
  }
  return await Vehicle.find({ status });
};

// ✅ Update vehicle status
export const updateStatus = async (id, status) => {
  return await Vehicle.findByIdAndUpdate(id, { status }, { new: true });
};
