// backend/services/instructorService.js
import Instructor from "../models/Instructor.js";
import Booking from "../models/Booking.js";

// Get all instructors
export const getInstructors = async () => {
  return await Instructor.find();
};

// Get instructor by ID
export const getInstructorById = async (id) => {
  return await Instructor.findById(id);
};

// Update instructor
export const updateInstructor = async (id, data) => {
  return await Instructor.findByIdAndUpdate(id, data, { new: true });
};

// Delete instructor
export const deleteInstructor = async (id) => {
  return await Instructor.findByIdAndDelete(id);
};

// ✅ Get available instructors (exclude booked ones)
export const getAvailableInstructors = async (date, time) => {
  if (!date || !time) {
    const allInstructors = await Instructor.find();
    return allInstructors.map((inst) => formatInstructor(inst));
  }

  const booked = await Booking.find({ date, time }).select("instructor");
  const bookedIds = booked.map((b) => b.instructor.toString());

  const availableInstructors = await Instructor.find({
    _id: { $nin: bookedIds },
  });

  return availableInstructors.map((inst) => formatInstructor(inst));
};

// ✅ Filter instructors only by status
export const filterInstructorsByStatus = async (status) => {
  if (!["Not-Active", "Active"].includes(status)) {
    throw new Error("Invalid status. Use 'Not-Active' or 'Active'.");
  }
  const instructors = await Instructor.find({ status });
  return instructors.map((inst) => formatInstructor(inst));
};

// 🔹 Helper: clean instructor object
const formatInstructor = (inst) => ({
  instructorId: inst.instructorId,
  name: inst.name,
  email: inst.email,
  phone: inst.phone,
  address: inst.address,
  licenseNumber: inst.licenseNumber,
  experienceYears: inst.experienceYears,
  specialization: inst.specialization,
  rating: inst.rating,
  status: inst.status,
  image: inst.image,
  availability: inst.availability,
  joinedDate: inst.joinedDate,
});
