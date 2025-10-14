import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookingAPI } from "../../api/bookingsApi";
import InstructorAPI from "../../api/instructorApi";
import ProgressHero from "../../components/ProgressHero";
import { Calendar, Clock, User, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react";

const EditBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [booking, setBooking] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [form, setForm] = useState({ date: "", time: "" });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [bk, instRes] = await Promise.all([
          BookingAPI.getById(id),
          InstructorAPI.getAll(),
        ]);

        setBooking(bk);
        const allInstructors = instRes.data?.filter((i) => i.status === "Active") || [];
        setInstructors(allInstructors);

        // Try to match by instructorId or _id
        const match = allInstructors.find(
          (i) => i.instructorId === bk.instructorId || i._id === bk.instructorId
        );
        if (match) {
          setSelectedInstructor(match);
          const dates = (match.availability || []).map((a) => a.date);
          setAvailableDates(dates);

          // preset date/time
          if (bk.date) {
            setForm({ date: new Date(bk.date).toISOString().slice(0, 10), time: bk.time || "" });
            const avail = (match.availability || []).find((a) => a.date === new Date(bk.date).toISOString().slice(0, 10));
            setAvailableTimeSlots(avail ? avail.timeSlots : []);
          }
        } else {
          // No match - still set form
          setForm({ date: bk.date ? new Date(bk.date).toISOString().slice(0, 10) : "", time: bk.time || "" });
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load booking.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleInstructorSelect = (instructor) => {
    setSelectedInstructor(instructor);
    // reset date/time
    setForm({ date: "", time: "" });
    const dates = (instructor.availability || []).map((a) => a.date);
    setAvailableDates(dates);
    setAvailableTimeSlots([]);
  };

  const handleDateSelect = (date) => {
    setForm((p) => ({ ...p, date, time: "" }));
    if (selectedInstructor) {
      const avail = (selectedInstructor.availability || []).find((a) => a.date === date);
      setAvailableTimeSlots(avail ? avail.timeSlots : []);
    }
  };

  const handleTimeSelect = (time) => {
    setForm((p) => ({ ...p, time }));
  };

  const canSave = useMemo(() => !!(selectedInstructor && form.date && form.time), [selectedInstructor, form]);

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        instructorId: selectedInstructor.instructorId || selectedInstructor._id,
        date: form.date,
        time: form.time,
      };
      await BookingAPI.update(id, payload);
      alert("Booking updated");
      navigate("/student/bookings");
    } catch (e) {
      console.error(e);
      alert("Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <ProgressHero
          title="Edit Booking"
          subtitle="Update instructor, date and time"
          icon={<Calendar className="w-8 h-8 text-white" />}
        />
        <div className="mt-4">
          <button
            onClick={() => navigate("/student/bookings")}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Bookings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Summary of current booking */}
        {booking && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Booking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Course</p>
                <p className="font-medium text-gray-900">{booking.course}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Vehicle</p>
                <p className="font-medium text-gray-900">{booking.regNo}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{booking.date ? new Date(booking.date).toLocaleDateString("en-GB") : "-"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{booking.time || "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step A: Choose Instructor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Choose Instructor</h2>
              <p className="text-sm text-gray-600">Change instructor if needed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map((instructor) => (
              <button
                key={instructor._id}
                onClick={() => handleInstructorSelect(instructor)}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  selectedInstructor?._id === instructor._id ? "border-blue-600 bg-blue-100 shadow-md" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-indigo-500 text-white font-bold text-sm">
                    {instructor.image ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${instructor.image}`}
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
                <h3 className="text-base font-semibold text-gray-900 mb-2">{instructor.name}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Step B: Pick Date & Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pick Date & Time</h2>
              <p className="text-sm text-gray-600">Select available slot</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Available Dates</h3>
              {!selectedInstructor ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Please select an instructor first</p>
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
                        form.date === date ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"
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
                            {new Date(date).toLocaleDateString("en-GB", { year: "numeric" })}
                          </p>
                        </div>
                        {form.date === date && (
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Available Time Slots</h3>
              {!form.date ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Please select a date first</p>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-12 h-12 text-orange-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No available time slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        form.time === slot ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <p className="text-sm text-gray-600">Update and save your booking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/student/bookings")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!canSave || saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBookingPage;
