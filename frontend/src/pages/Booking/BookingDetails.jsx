import React, { useEffect, useState } from "react";
import { BookingAPI } from "../../api/bookingsApi";
import InstructorAPI from "../../api/instructorApi";
import vehicleApi from "../../api/vehicleApi";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  X,
  CheckCircle,
  AlertCircle,
  Send ,
  MapPin
} from "lucide-react";

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
        if (!value) newErrors.courseName = "Course name is required";
        else delete newErrors.courseName;
        break;
      case "instructorName":
        if (!value) newErrors.instructorName = "Instructor is required";
        else delete newErrors.instructorName;
        break;
      case "vehicleRegNo":
        if (!value) newErrors.vehicleRegNo = "Vehicle registration number is required";
        else delete newErrors.vehicleRegNo;
        break;
      case "date":
        if (!value) newErrors.date = "Date is required";
        else delete newErrors.date;
        break;
      case "time":
        if (!value) newErrors.time = "Time slot is required";
        else delete newErrors.time;
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

    if (Object.keys(errors).length > 0) return;

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

  const handleDownloadReceipt = (bookingId) => {
    const fileName = `booking_${bookingId}.pdf`;
    const downloadUrl = `http://localhost:5000/download/${fileName}`;
    window.open(downloadUrl, "_blank");
  };

  // ✅ Send booking PDF email
const handleSendEmail = async (bookingId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("rg_token")}`, // 👈 if you're using JWT
      },
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    alert("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    alert("Failed to send email. Please try again.");
  }
};



  const getStatusBadge = (status) => {
    const statusConfig = {
      'booked': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'completed': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'cancelled': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <X className="w-4 h-4" />
      }
    };

    const config = statusConfig[status] || statusConfig['booked'];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                <p className="text-orange-100 mt-1">Manage your driving lesson appointments</p>
              </div>
            </div>
            <button
              onClick={() => openModal("create")}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredBookings.filter(b => b.status === 'booked').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredBookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
            <p className="text-gray-600 mt-1">View and manage your driving lesson appointments</p>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">Start your driving journey by creating your first booking</p>
                <button
                  onClick={() => openModal("create")}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Booking
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Booking Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mt-1">
                            <BookOpen className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Course</p>
                            <p className="font-semibold text-gray-900 mt-1">{booking.course}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mt-1">
                            <User className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Instructor</p>
                            <p className="font-semibold text-gray-900 mt-1">{booking.instructorId}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mt-1">
                            <Car className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Vehicle</p>
                            <p className="font-semibold text-gray-900 mt-1 font-mono">{booking.regNo}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mt-1">
                            <Clock className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Date & Time</p>
                            <p className="font-semibold text-gray-900 mt-1">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">{booking.time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
                        <div className="lg:text-right">
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadReceipt(booking.bookingId)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Receipt
                          </button>
                          <button
                            onClick={() => handleSendEmail(booking.bookingId)}
                             className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                             >
                           <Send className="w-4 h-4" />
                           Send Email
                           </button>
                          <button
                            onClick={() => openModal("edit", booking)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {modalType === "create" ? "Create New Booking" : "Edit Booking"}
                  </h2>
                  <p className="text-orange-100 text-sm mt-1">
                    {modalType === "create" ? "Schedule your driving lesson" : "Update your booking details"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Course Type <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.student_course_id} value={course.course_name}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                  {errors.courseName && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-600 text-sm">{errors.courseName}</p>
                    </div>
                  )}
                </div>

                {/* Instructor Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Instructor <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor.name}>
                        {instructor.name} - {instructor.specialization} ({instructor.experienceYears} years)
                      </option>
                    ))}
                  </select>
                  {errors.instructorName && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-600 text-sm">{errors.instructorName}</p>
                    </div>
                  )}
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Vehicle <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="vehicleRegNo"
                    value={formData.vehicleRegNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle.regNo}>
                        {vehicle.regNo} - {vehicle.brand} {vehicle.model} ({vehicle.type})
                      </option>
                    ))}
                  </select>
                  {errors.vehicleRegNo && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-600 text-sm">{errors.vehicleRegNo}</p>
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Date <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    disabled={!selectedInstructor || availableDates.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedInstructor ? "Select instructor first" : "Select date"}
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
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-600 text-sm">{errors.date}</p>
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Time Slot <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    disabled={!selectedInstructor || !formData.date || availableTimeSlots.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-600 text-sm">{errors.time}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 mt-8">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
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