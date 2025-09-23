// src/pages/Instructor/EditInstructorPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import InstructorAPI from "../../api/instructorApi";

export default function EditInstructorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // availability
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await InstructorAPI.getById(id);
        setForm(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, [id]);

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
    if (!date || !startTime || !endTime) return;
    if (endTime <= startTime) {
      setError("End time must be greater than start time");
      return;
    }

    const d = date.toISOString().split("T")[0];
    const range = `${startTime}-${endTime}`;

    setForm((f) => {
      const exists = f.availability?.find((a) => a.date === d);
      if (exists) {
        if (!exists.timeSlots.includes(range)) {
          exists.timeSlots = [...exists.timeSlots, range];
        }
        return { ...f, availability: [...f.availability] };
      }
      return {
        ...f,
        availability: [...(f.availability || []), { date: d, timeSlots: [range] }],
      };
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
    setSaving(true);
    setError("");
    try {
      let payload;
      if (image) {
        const fd = new FormData();
        [
          "name",
          "email",
          "phone",
          "address",
          "licenseNumber",
          "experienceYears",
          "specialization",
          "status",
        ].forEach((k) => fd.append(k, form[k] ?? ""));
        fd.append("availability", JSON.stringify(form.availability || []));
        fd.append("image", image);
        payload = fd;
      } else {
        payload = { ...form, availability: form.availability || [] };
      }
      await InstructorAPI.update(id, payload);
      nav(`/instructors/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading instructor data...</p>
        </div>
      </div>
    );

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const currentImageUrl = preview
    ? preview
    : form.image
    ? form.image.startsWith("http")
      ? form.image
      : `${API_URL}${form.image}`
    : "/no-avatar.png";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-xl text-gray-800">
          <span className="text-orange-500 text-2xl">🎯</span>
          Instructor Management
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 font-medium">
             Vehicle Management
          </Link>
          <Link to="/instructors" className="px-4 py-2 rounded-lg text-orange-500 bg-orange-50 font-medium">
             Instructors Management
          </Link>
          <Link to="/students" className="px-4 py-2 rounded-lg text-slate-600 hover:text-orange-500 hover:bg-orange-50 font-medium">
            👨‍🎓 Students
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Instructor</h1>
            <p className="text-slate-600 text-lg">Update instructor profile and availability</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/instructors/${id}`} className="bg-white border px-6 py-3 rounded-lg hover:bg-slate-50">← Back to Profile</Link>
            <Link to="/instructors" className="bg-white border px-6 py-3 rounded-lg hover:bg-slate-50">All Instructors</Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-8 space-y-8">
            {error && <div className="p-4 bg-red-50 border text-red-700 rounded-lg">{error}</div>}

            {/* Profile Image */}
            <div>
              <h3 className="text-lg font-semibold mb-2">📸 Profile Image</h3>
              <div className="w-40 h-40 mb-4 rounded-full overflow-hidden border">
                <img src={currentImageUrl} alt="preview" className="w-full h-full object-cover"/>
              </div>
              <input type="file" accept="image/*" onChange={onImage}/>
            </div>

            {/* Main fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="name" value={form.name} onChange={onChange} required />
              <Input label="Email" name="email" value={form.email} onChange={onChange} type="email" required />
              <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
              <Input label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={onChange} required />
              <Input label="Experience (Years)" name="experienceYears" type="number" value={form.experienceYears} onChange={onChange} />
              <div>
                <label className="block mb-2">Specialization</label>
                <select name="specialization" value={form.specialization} onChange={onChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="All">All</option>
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Threewheeler">Threewheeler</option>
                  <option value="HeavyVehicle">Heavy Vehicle</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2">Address</label>
                <textarea name="address" value={form.address} onChange={onChange} rows={3} className="w-full px-3 py-2 border rounded-lg"/>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2">Status</label>
              <div className="flex gap-4">
                <RadioCard label="Active" value="Active" checked={form.status === "Active"} onChange={onChange} active />
                <RadioCard label="Not Active" value="Not-Active" checked={form.status === "Not-Active"} onChange={onChange} />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block mb-2">Availability</label>
              <div className="flex gap-2 mb-4">
                <input type="date" value={date.toISOString().split("T")[0]} onChange={(e) => setDate(new Date(e.target.value))} className="px-3 py-2 border rounded-lg"/>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="px-3 py-2 border rounded-lg"/>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="px-3 py-2 border rounded-lg"/>
                <button type="button" onClick={addAvailability} className="px-4 py-2 bg-orange-500 text-white rounded-lg">➕ Add</button>
              </div>
              {form.availability?.length > 0 ? (
                <ul className="space-y-2">
                  {form.availability.map((a) => (
                    <li key={a.date} className="p-3 bg-slate-50 border rounded-lg flex flex-wrap gap-2">
                      <span className="font-medium">{a.date}</span>
                      {a.timeSlots.map((t) => (
                        <span key={t} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm flex items-center gap-1">
                          {t}
                          <button type="button" onClick={() => removeSlot(a.date, t)} className="text-red-500">✖</button>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">No availability added yet</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t px-8 py-6 flex justify-end gap-3">
            <Link to={`/instructors/${id}`} className="px-6 py-3 bg-white border rounded-lg">Cancel</Link>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-orange-500 text-white rounded-lg">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---- Small components ---- */
function Input({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block mb-2">{label}{required && <span className="text-red-500">*</span>}</label>
      <input type={type} name={name} value={value || ""} onChange={onChange} required={required} className="w-full px-3 py-2 border rounded-lg"/>
    </div>
  );
}

function RadioCard({ label, value, checked, onChange, active }) {
  return (
    <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
      checked ? (active ? "border-green-400 bg-green-50" : "border-amber-400 bg-amber-50")
      : "border-slate-200 bg-slate-50"
    }`}>
      <input type="radio" name="status" value={value} checked={checked} onChange={onChange} className="hidden"/>
      <span>{label}</span>
    </label>
  );
}
