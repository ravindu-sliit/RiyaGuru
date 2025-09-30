import { useEffect, useState } from "react";
import { vehicleService } from "../../services/vehicleService";
import InstructorAPI from "../../api/instructorApi";
import { BookingAPI } from "../../api/bookingsApi";
import vehicleApi from "../../api/vehicleApi";
import { StudentCourseAPI } from "../../api/studentCourseApi";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Car,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Phone,
  Award,
  Check,
} from "lucide-react";

const AddBookingPage = () => {
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
        if (!value) {
          newErrors.vehicleRegNo = "Vehicle registration number is required";
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

  const handleCourseSelect = (courseName) => {
    setFormData((prev) => ({ ...prev, courseName }));
    validateField("courseName", courseName);
  };

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);
    setFormData((prev) => ({
      ...prev,
      instructorName: instructor.name,
      time: "",
      date: "",
    }));
    setAvailableTimeSlots([]);
    validateField("instructorName", instructor.name);

    const dates = instructor.availability.map((avail) => avail.date);
    setAvailableDates(dates);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData((prev) => ({ ...prev, vehicleRegNo: vehicle.regNo }));
    validateField("vehicleRegNo", vehicle.regNo);
  };

  const handleDateSelect = (date) => {
    setFormData((prev) => ({ ...prev, date, time: "" }));
    validateField("date", date);
    if (selectedInstructor) {
      updateTimeSlots(selectedInstructor, date);
    }
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time }));
    validateField("time", time);
  };

  const updateTimeSlots = (instructor, date) => {
    const availability = instructor.availability.find(
      (avail) => avail.date === date
    );
    setAvailableTimeSlots(availability ? availability.timeSlots : []);
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

      // ✅ Navigate to bookings page
      navigate("/student/bookings");
    } catch (error) {
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ match course name to vehicle type
  let filteredVehicles = vehicles;

  if (formData.courseName) {
    const course = formData.courseName.toLowerCase();

    if (course.includes("car")) {
      filteredVehicles = vehicles.filter((v) => v.type.toLowerCase() === "car");
    } else if (course.includes("motorcycle")) {
      filteredVehicles = vehicles.filter(
        (v) => v.type.toLowerCase() === "motorcycle"
      );
    } else if (course.includes("threewheeler")) {
      filteredVehicles = vehicles.filter(
        (v) => v.type.toLowerCase() === "threewheeler"
      );
    } else if (course.includes("heavyvehicle")) {
      filteredVehicles = vehicles.filter(
        (v) => v.type.toLowerCase() === "heavyvehicle"
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Book a Driving Lesson
                </h1>
                <p className="text-orange-100 mt-1">
                  Schedule your next learning session
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Step 1: Course Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 1: Select Course
                </h2>
                <p className="text-sm text-gray-600">
                  Choose your learning program
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <button
                  key={course.student_course_id}
                  onClick={() => handleCourseSelect(course.course_name)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
  formData.courseName === course.course_name
    ? "border-orange-600 bg-orange-100 shadow-md"
    : "border-gray-200 hover:border-orange-400 hover:bg-orange-50 bg-white"
}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {course.course_name}
                      </h3>
                    </div>
                    {formData.courseName === course.course_name && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.courseName && (
              <div className="flex items-center gap-2 mt-4">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-600 text-sm">{errors.courseName}</p>
              </div>
            )}
          </div>

          {/* Step 2: Instructor Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 2: Choose Instructor
                </h2>
                <p className="text-sm text-gray-600">
                  Select your preferred instructor
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instructors.map((instructor) => (
                <button
                  key={instructor._id}
                  onClick={() => handleInstructorSelect(instructor)}
                 className={`p-5 rounded-xl border-2 transition-all text-left ${
  selectedInstructor?._id === instructor._id
    ? "border-blue-600 bg-blue-100 shadow-md"
    : "border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white"
}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-orange-500 text-white font-bold text-sm">
                      {instructor.image ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL.replace(
                            "/api",
                            ""
                          )}${instructor.image}`}
                          alt={instructor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/avatar.png";
                          }}
                        />
                      ) : (
                        instructor.name?.charAt(0)?.toUpperCase() || "?"
                      )}
                    </div>
                    {selectedInstructor?._id === instructor._id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>

                  {/* Instructor Name */}
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {instructor.name}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{instructor.experienceYears} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{instructor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{instructor.specialization}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {errors.instructorName && (
              <div className="flex items-center gap-2 mt-4">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-600 text-sm">{errors.instructorName}</p>
              </div>
            )}
          </div>

          {/* Step 3: Vehicle Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 3: Select Vehicle
                </h2>
                <p className="text-sm text-gray-600">
                  Choose your practice vehicle
                </p>
              </div>
            </div>

            {/* ✅ filter vehicles based on selected course */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles
                .filter((vehicle) => {
                  if (!formData.courseName) return true;
                  const course = formData.courseName.toLowerCase();
                  if (course.includes("car"))
                    return vehicle.type.toLowerCase() === "car";
                  if (course.includes("motorcycle"))
                    return vehicle.type.toLowerCase() === "motorcycle";
                  if (course.includes("threewheeler"))
                    return vehicle.type.toLowerCase() === "threewheeler";
                  if (course.includes("heavyvehicle"))
                    return vehicle.type.toLowerCase() === "heavyvehicle";
                  return true; // default: show all
                })
                .map((vehicle) => (
                  <button
                    key={vehicle._id}
                    onClick={() => handleVehicleSelect(vehicle)}
                   className={`p-5 rounded-xl border-2 transition-all transform text-left ${
  selectedVehicle?._id === vehicle._id
    ? "border-green-600 bg-green-100 shadow-lg scale-105"
    : "border-gray-200 hover:border-green-400 hover:bg-green-50 bg-white"
}`}

                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-32 bg-gray-100 flex items-center justify-center border-b">
                        {vehicle.image ? (
                          <img
                            src={`http://localhost:5000${vehicle.image}`}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder-car.png";
                            }}
                          />
                        ) : (
                          <Car size={40} className="text-gray-400" />
                        )}
                      </div>
                      {selectedVehicle?._id === vehicle._id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 font-mono text-lg">
                        {vehicle.regNo}
                      </h3>
                      <p className="font-semibold text-gray-800">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {vehicle.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {vehicle.fuelType}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {errors.vehicleRegNo && (
              <div className="flex items-center gap-2 mt-4">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-600 text-sm">{errors.vehicleRegNo}</p>
              </div>
            )}
          </div>

          {/* Step 4: Date and Time Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 4: Pick Date & Time
                </h2>
                <p className="text-sm text-gray-600">Select available slot</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Available Dates
                </h3>
                {!selectedInstructor ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Please select an instructor first
                    </p>
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-orange-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No available dates</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.date === date
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(date).toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(date).toLocaleDateString("en-GB", {
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          {formData.date === date && (
                            <CheckCircle className="w-5 h-5 text-purple-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.date && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 text-sm">{errors.date}</p>
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Available Time Slots
                </h3>
                {!formData.date ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Please select a date first
                    </p>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-orange-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No available time slots
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.time === slot
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {slot}
                          </span>
                          {formData.time === slot && (
                            <Check className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.time && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-600 text-sm">{errors.time}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-600">
                Please review all details before booking
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookingPage;
