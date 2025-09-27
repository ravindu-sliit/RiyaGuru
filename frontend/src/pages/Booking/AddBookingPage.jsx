import { useEffect, useState } from "react";
import InstructorAPI from "../../api/instructorApi";
import { BookingAPI } from "../../api/bookingsApi";
import vehicleApi from "../../api/vehicleApi";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import { useNavigate } from "react-router-dom";

const AddBookingPage = () => {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const UPLOADS_BASE = API_BASE.replace(/\/api$/, "") + "/uploads";
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseName: "",
    instructorName: "",
    vehicleRegNo: "",
    date: "",
    time: "",
  });
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        const vehicleRegex = /^[A-Z]{2,3}-\d{4}$/;
        if (!value) {
          newErrors.vehicleRegNo = "Vehicle registration number is required";
        } else if (!vehicleRegex.test(value)) {
          newErrors.vehicleRegNo = "Invalid format. Use format: ABC1234";
        } else {
          delete newErrors.vehicleRegNo;
        }
        break;
      case "date":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        if (!value) {
          newErrors.date = "Date is required";
        } else if (selectedDate < today) {
          newErrors.date = "Date cannot be in the past";
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

    if (name === "vehicleRegNo") {
      const vehicle = vehicles.find((v) => v.regNo === value);
      setSelectedVehicle(vehicle);
    }
  };

  const updateTimeSlots = (instructor, date) => {
    const availability = instructor.availability.find(
      (avail) => avail.date === date
    );
    setAvailableTimeSlots(availability ? availability.timeSlots : []);
  };
  const downloadReceipt = (bookingId) => {
    const receiptUrl = `${UPLOADS_BASE}/receipts/${bookingId}.pdf`;

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = receiptUrl;
    link.download = `receipt_${bookingId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const studentId = localStorage.getItem("rg_userId");
      const payload = {
        studentId,
        ...formData,
        course: formData.courseName,
        instructorId: selectedInstructor.instructorId,
        regNo: formData.vehicleRegNo,
      };

      const booking = await BookingAPI.create(payload);
      const bookingId = booking.booking.bookingId;
      alert("Booking created successfully! " + bookingId);
      downloadReceipt(bookingId);
      // Reset form
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

      //navigate("/my-bookings");
    } catch (error) {
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl font-bold">Book a Driving Lesson</h1>
            <p className="text-gray-300 mt-1">
              Fill in the details to schedule your lesson
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Course Type <span className="text-orange-500">*</span>
              </label>
              <select
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                <p className="text-red-500 text-sm mt-1">{errors.courseName}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

            {/* Vehicle Registration */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Vehicle Registration Number{" "}
                <span className="text-orange-500">*</span>
              </label>
              <select
                name="vehicleRegNo"
                value={formData.vehicleRegNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedInstructor
                    ? "Select instructor first"
                    : availableDates.length === 0
                    ? "No available dates"
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

            {/* Time Slot Selection */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedInstructor || !formData.date
                    ? "Select instructor and date first"
                    : availableTimeSlots.length === 0
                    ? "No available time slots"
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

            {/* Instructor Info Card */}
            {selectedInstructor && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Instructor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">
                      {selectedInstructor.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Experience:</span>
                    <span className="ml-2 font-medium">
                      {selectedInstructor.experienceYears} years
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialization:</span>
                    <span className="ml-2 font-medium">
                      {selectedInstructor.specialization}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">
                      {selectedInstructor.phone}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
              >
                {loading ? "Creating Booking..." : "Book Lesson"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookingPage;
