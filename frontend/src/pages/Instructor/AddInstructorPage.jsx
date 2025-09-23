// src/pages/Instructor/AddInstructorPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // field-level errors
  const [errors, setErrors] = useState({});

  // availability state
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required.";
        break;
      case "email":
        if (!value.trim()) return "Email is required.";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format.";
        break;
      case "licenseNumber":
        if (!value.trim()) return "License Number is required.";
        break;
      case "password":
        if (!value.trim()) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        break;
      case "phone":
        if (value && !/^\d{10,15}$/.test(value)) return "Phone must be 10–15 digits.";
        break;
      case "experienceYears":
        if (value < 0) return "Experience cannot be negative.";
        break;
      default:
        return "";
    }
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "experienceYears" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onImage = (e) => {
    const f = e.target.files?.[0];
    setImage(f || null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const addAvailability = () => {
    if (!date || !startTime || !endTime) return;
    if (endTime <= startTime) {
      setError("End time must be greater than start time");
      return;
    }

    const d = date.toISOString().split("T")[0];
    const range = `${startTime}-${endTime}`;

    setForm((f) => {
      const exists = f.availability.find((a) => a.date === d);
      if (exists) {
        if (!exists.timeSlots.includes(range)) {
          exists.timeSlots = [...exists.timeSlots, range];
        }
        return { ...f, availability: [...f.availability] };
      }
      return { ...f, availability: [...f.availability, { date: d, timeSlots: [range] }] };
    });

    setStartTime("09:00");
    setEndTime("10:00");
    setError("");
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

  const submit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(form).forEach(([k, v]) => {
      const msg = validateField(k, v);
      if (msg) newErrors[k] = msg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      await axios.post("http://localhost:5000/api/instructors", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/instructors/list");
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold">Instructor Management</h1>
          <nav className="hidden md:flex space-x-2">
            <a href="/dashboard" className="px-3 py-2 text-slate-600 hover:text-orange-500">Vehicle Dashboard</a>
            <a href="/instructors" className="px-3 py-2 text-orange-500 bg-orange-50 rounded-lg">Instructors Dashboard</a>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Add New Instructor</h1>
        <p className="text-slate-600 mb-8">Create a new instructor profile with availability schedule</p>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={submit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 p-4 text-red-700 rounded-lg">{error}</div>}

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1">Full Name *</label>
                <input type="text" name="name" value={form.name} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div>
                <label className="block mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            {/* Phone + License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1">Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
              <div>
                <label className="block mb-1">License Number *</label>
                <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.licenseNumber && <p className="text-red-500 text-sm">{errors.licenseNumber}</p>}
              </div>
            </div>

            {/* Password + Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1">Password *</label>
                <input type="password" name="password" value={form.password} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <div>
                <label className="block mb-1">Experience (Years)</label>
                <input type="number" name="experienceYears" min="0" value={form.experienceYears} onChange={onChange} onBlur={onBlur}
                  className="w-full px-4 py-2 border rounded-lg"/>
                {errors.experienceYears && <p className="text-red-500 text-sm">{errors.experienceYears}</p>}
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block mb-1">Specialization</label>
              <select name="specialization" value={form.specialization} onChange={onChange}
                className="w-full px-4 py-2 border rounded-lg">
                <option value="All">All</option>
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Threewheeler">Threewheeler</option>
                <option value="HeavyVehicle">Heavy Vehicle</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={onChange} rows={3}
                className="w-full px-4 py-2 border rounded-lg"/>
            </div>

            {/* Profile Image */}
            <div>
              <label className="block mb-1">Profile Image</label>
              <input type="file" accept="image/*" onChange={onImage}
                className="block w-full text-sm"/>
              {preview && <img src={preview} alt="Preview" className="w-32 h-32 mt-4 rounded-full object-cover border"/>}
            </div>

            {/* Availability */}
            <div>
              <label className="block mb-1">Availability</label>
              <div className="flex gap-2 mb-4">
                <input type="date" value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="px-3 py-2 border rounded-lg"/>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-2 border rounded-lg"/>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="px-3 py-2 border rounded-lg"/>
                <button type="button" onClick={addAvailability}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg">➕ Add</button>
              </div>
              {form.availability.length > 0 ? (
                <ul className="space-y-2">
                  {form.availability.map((a) => (
                    <li key={a.date} className="p-3 bg-slate-50 border rounded-lg flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.date}</span>
                      {a.timeSlots.map((t) => (
                        <span key={t} className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                          {t}
                          <button type="button" onClick={() => removeSlot(a.date, t)} className="ml-1 text-red-500 hover:text-red-700">✖</button>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No availability added yet</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button type="button" onClick={() => navigate("/instructors")}
                className="px-6 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:bg-orange-300 flex items-center gap-2">
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
