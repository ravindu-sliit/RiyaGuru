// src/pages/Instructor/AddInstructorPage.jsx
import { useState } from "react";

const initial = {
  name: "",
  email: "",
  phone: "",
  address: "",
  licenseNumber: "",
  experienceYears: 0,
  specialization: "All",
  password: "",
  availability: [],
};

export default function AddInstructorPage() {
  const nav = (path) => console.log("Navigate to:", path);
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "experienceYears" ? Number(value) : value,
    }));
  };

  const onImage = (e) => {
    const f = e.target.files?.[0];
    setImage(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const addAvailability = () => {
    if (!date || !time) return;
    const d = date.toISOString().split("T")[0];
    const newSlot = { date: d, timeSlots: [time] };

    setForm((f) => {
      const exists = f.availability.find((a) => a.date === d);
      if (exists) {
        if (!exists.timeSlots.includes(time)) {
          exists.timeSlots = [...exists.timeSlots, time];
        }
        return { ...f, availability: [...f.availability] };
      }
      return { ...f, availability: [...f.availability, newSlot] };
    });
    setTime("09:00");
  };

  const removeSlot = (d, t) => {
    setForm((f) => {
      const updated = f.availability
        .map((a) =>
          a.date === d
            ? { ...a, timeSlots: a.timeSlots.filter((ts) => ts !== t) }
            : a
        )
        .filter((a) => a.timeSlots.length > 0);
      return { ...f, availability: updated };
    });
  };

  const validate = () => {
    if (!form.name || !form.email || !form.licenseNumber || !form.password)
      return "Name, Email, License Number and Password are required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "availability") {
          fd.append("availability", JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      if (image) fd.append("image", image);

      // Mock API call
      console.log("Creating instructor:", form);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      nav("/instructors/list");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
            
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Instructor Management
              </h1>
            </div>
            <nav className="hidden md:flex space-x-1">
              <a
                href="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition"
              >
                Vehicle DashBoard
              </a>
              <a
                href="/instructors"
                className="px-3 py-2 rounded-lg text-sm font-medium text-orange-500 bg-orange-50"
              >
                Instructors DashBoard
              </a>
              
               
            
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Add New Instructor
          </h1>
          <p className="text-slate-600 mt-2">
            Create a new instructor profile with availability schedule
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={submit} className="p-6 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                  required
                />
              </div>
            </div>

            {/* Phone + License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password + Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experienceYears"
                  min="0"
                  value={form.experienceYears}
                  onChange={onChange}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Specialization
              </label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
              >
                <option value="All"> All</option>
                <option value="Car">Car</option>
                <option value="Motorcycle"> Motorcycle</option>
                <option value="Threewheeler"> Threewheeler</option>
                <option value="HeavyVehicle">Heavy Vehicle</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none"
                rows={3}
              />
            </div>

            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onImage}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Availability
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-3 py-2 border-2 border-slate-200 rounded-lg bg-slate-50"
                />
                <button
                  type="button"
                  onClick={addAvailability}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  ➕ Add
                </button>
              </div>
              {form.availability.length > 0 ? (
                <ul className="space-y-2">
                  {form.availability.map((a) => (
                    <li
                      key={a.date}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-2"
                    >
                      <span className="font-medium">{a.date}</span>
                      {a.timeSlots.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeSlot(a.date, t)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            
                          </button>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No availability added yet</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => nav("/instructors")}
                className="px-6 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save Instructor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
