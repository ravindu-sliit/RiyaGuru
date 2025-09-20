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

// ✅ Get available instructors (ignore status, only check date & time)
export const getAvailableInstructors = async (date, time) => {
  if (!date || !time) {
    // No date & time → return all instructors
    const allInstructors = await Instructor.find();
    return allInstructors.map((inst) => formatInstructor(inst));
  }

  // Date & time provided → exclude instructors already booked
  const booked = await Booking.find({ date, time }).select("instructor");
  const bookedIds = booked.map((b) => b.instructor.toString());

  const availableInstructors = await Instructor.find({
    _id: { $nin: bookedIds }
  });

  return availableInstructors.map((inst) => formatInstructor(inst));
};

// Filter instructors only by status (new feature)
export const filterInstructorsByStatus = async (status) => {
  if (!["Not-Active", "Active"].includes(status)) {
    throw new Error("Invalid status. Use 'Not-Active' or 'Active'.");
  }
  const instructors = await Instructor.find({ status });
  return instructors.map((inst) => formatInstructor(inst));
};

// Update instructor status
export const updateStatus = async (id, status) => {
  return await Instructor.findByIdAndUpdate(id, { status }, { new: true });
};

// 🔹 Helper function to format instructor response
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
  availability: inst.availability,
  joinedDate: inst.joinedDate
});

// ✅ Get instructors by status
export const getInstructorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const instructors = await instructorService.getInstructorsByStatus(status);
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

