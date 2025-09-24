import React, { useEffect, useState } from "react";
import { BookingAPI } from "../../api/bookingsApi";
import InstructorAPI from "../../api/instructorApi";
import vehicleApi from "../../api/vehicleApi";
import { StudentCourseAPI } from "../../api/studentCourseApi";

const BookingDetails = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    courseName: "",
    instructorName: "",
    vehicleRegNo: "",
    date: "",
    time: "",
  });
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchBookings = async () => {
    try {
      const response = await BookingAPI.getAll();
      const userBookings = response.filter(
        (booking) => booking.userId === localStorage.getItem("rg_userId")
      );
      setBookings(response);
      setFilteredBookings(userBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  const fetchInitialData = async () => {
    const [courses, instructors, vehicles] = await Promise.all([
      StudentCourseAPI.getByStudentId(localStorage.getItem("rg_userId")),
      InstructorAPI.getAll(),
      vehicleApi.getAll(),
    ]);
    setCourses(courses);
    setInstructors(instructors.data.filter((inst) => inst.status === "Active"));
    setVehicles(vehicles.data);
  };

  useEffect(() => {
    fetchBookings();
    fetchInitialData();
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "courseName":
        if (!value) {
          newErrors.courseName = "Course name is required";
        } else {
          delete newErrors.courseName;
        }
        break;
      case "instructorName":
        if (!value) {
          newErrors.instructorName = "Instructor is required";
        } else {
          delete newErrors.instructorName;
        }
        break;
      case "vehicleRegNo":
        if (!value) {
          newErrors.vehicleRegNo = "Vehicle registration number is required";
        } else {
          delete newErrors.vehicleRegNo;
        }
        break;
      case "date":
        if (!value) {
          newErrors.date = "Date is required";
        } else {
          delete newErrors.date;
        }
        break;
      case "time":
        if (!value) {
          newErrors.time = "Time slot is required";
        } else {
          delete newErrors.time;
        }
        break;
      default:
        return;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "instructorName") {
      const instructor = instructors.find((inst) => inst.name === value);
      setSelectedInstructor(instructor);
      setFormData((prev) => ({ ...prev, time: "", date: "" }));
      setAvailableTimeSlots([]);

      if (instructor) {
        const dates = instructor.availability.map((avail) => avail.date);
        setAvailableDates(dates);
      } else {
        setAvailableDates([]);
      }
    }

    if (name === "date" && selectedInstructor) {
      setFormData((prev) => ({ ...prev, time: "" }));
      updateTimeSlots(selectedInstructor, value);
    }
  };

  const updateTimeSlots = (instructor, date) => {
    const availability = instructor.availability.find(
      (avail) => avail.date === date
    );
    setAvailableTimeSlots(availability ? availability.timeSlots : []);
  };

  const openModal = (type, booking = null) => {
    setModalType(type);
    setSelectedBooking(booking);

    if (type === "edit" && booking) {
      setFormData({
        courseName: booking.course,
        instructorName: booking.instructorId,
        vehicleRegNo: booking.regNo,
        date: booking.date,
        time: booking.time,
      });

      const instructor = instructors.find(
        (inst) => inst.instructorId === booking.instructorId
      );
      if (instructor) {
        setSelectedInstructor(instructor);
        const dates = instructor.availability.map((avail) => avail.date);
        setAvailableDates(dates);
        updateTimeSlots(instructor, booking.date);
      }
    } else {
      setFormData({
        courseName: "",
        instructorName: "",
        vehicleRegNo: "",
        date: "",
        time: "",
      });
      setSelectedInstructor(null);
      setAvailableTimeSlots([]);
      setAvailableDates([]);
    }

    setShowModal(true);
    setErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setFormData({
      courseName: "",
      instructorName: "",
      vehicleRegNo: "",
      date: "",
      time: "",
    });
    setSelectedInstructor(null);
    setAvailableTimeSlots([]);
    setAvailableDates([]);
    setErrors({});
  };

  const handleSubmit = async () => {
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        studentId: localStorage.getItem("rg_userId"),
        courseName: formData.courseName,
        instructorName: selectedInstructor?.name || formData.instructorName,
        vehicleRegNo: formData.vehicleRegNo,
        date: formData.date,
        time: formData.time,
        course: formData.courseName,
        instructorId: selectedInstructor.instructorId,
        regNo: formData.vehicleRegNo,
      };

      if (modalType === "create") {
        await BookingAPI.create(payload);
        alert("Booking created successfully!");
      } else {
        await BookingAPI.update(selectedBooking._id, payload);
        alert("Booking updated successfully!");
      }

      closeModal();
      fetchBookings();
    } catch (error) {
      alert("Failed to process booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await BookingAPI.remove(bookingId);
        alert("Booking deleted successfully!");
        fetchBookings();
      } catch (error) {
        alert("Failed to delete booking. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-gray-300 mt-1">
                Manage your driving lesson bookings
              </p>
            </div>
            <button
              onClick={() => openModal("create")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              New Booking
            </button>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <span className="text-sm text-gray-600">Course:</span>
                          <p className="font-medium">{booking.course}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Instructor:
                          </span>
                          <p className="font-medium">{booking.instructorId}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Vehicle:
                          </span>
                          <p className="font-medium">{booking.regNo}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Date & Time:
                          </span>
                          <p className="font-medium">
                            {new Date(booking.date).toLocaleDateString()} -{" "}
                            {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === "booked"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <button
                          onClick={() => openModal("edit", booking)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold">
                {modalType === "create" ? "Create New Booking" : "Edit Booking"}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Course Type <span className="text-orange-500">*</span>
                </label>
                <select
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option
                      key={course.student_course_id}
                      value={course.course_name}
                    >
                      {course.course_name}
                    </option>
                  ))}
                </select>
                {errors.courseName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.courseName}
                  </p>
                )}
              </div>

              {/* Instructor Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Instructor <span className="text-orange-500">*</span>
                </label>
                <select
                  name="instructorName"
                  value={formData.instructorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor.name}>
                      {instructor.name} - {instructor.specialization} (
                      {instructor.experienceYears} years)
                    </option>
                  ))}
                </select>
                {errors.instructorName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.instructorName}
                  </p>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Vehicle <span className="text-orange-500">*</span>
                </label>
                <select
                  name="vehicleRegNo"
                  value={formData.vehicleRegNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle.regNo}>
                      {vehicle.regNo} - {vehicle.brand} {vehicle.model} (
                      {vehicle.type})
                    </option>
                  ))}
                </select>
                {errors.vehicleRegNo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.vehicleRegNo}
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Date <span className="text-orange-500">*</span>
                </label>
                <select
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  disabled={!selectedInstructor || availableDates.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {!selectedInstructor
                      ? "Select instructor first"
                      : "Select date"}
                  </option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </option>
                  ))}
                </select>
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Time Slot <span className="text-orange-500">*</span>
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  disabled={
                    !selectedInstructor ||
                    !formData.date ||
                    availableTimeSlots.length === 0
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {!selectedInstructor || !formData.date
                      ? "Select instructor and date first"
                      : "Select time slot"}
                  </option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-6 rounded-md"
                >
                  {loading
                    ? "Processing..."
                    : modalType === "create"
                    ? "Create Booking"
                    : "Update Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
