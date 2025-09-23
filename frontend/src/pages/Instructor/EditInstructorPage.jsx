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
        fd.append("image", image);
        payload = fd;
      } else {
        payload = { ...form };
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading instructor data...</p>
        </div>
      </div>
    );

  // Build safe image URL
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
      <nav className="flex justify-between items-center bg-white px-8 py-4 border-b border-slate-200 shadow-sm sticky top-0 z-50">
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
            <p className="text-slate-600 text-lg">Update instructor profile and information</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/instructors/${id}`} className="bg-white border px-6 py-3 rounded-lg hover:bg-slate-50 hover:border-slate-300 font-medium">
              ← Back to Profile
            </Link>
            <Link to="/instructors" className="bg-white border px-6 py-3 rounded-lg hover:bg-slate-50 hover:border-slate-300 font-medium">
               All Instructors
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 border-b px-8 py-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              Instructor Information
            </h2>
            {form.name && (
              <p className="text-slate-600 mt-2">
                Editing profile for: <span className="font-medium">{form.name}</span>
              </p>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                 {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image */}
              <div className="bg-slate-50 rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-4">📸 Profile Image</h3>
                <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-orange-500 p-1 shadow-lg">
                  <img
                    src={currentImageUrl}
                    alt="preview"
                    className="w-full h-full object-cover rounded-full border-4 border-white"
                    onError={(e) => {
                      e.currentTarget.src = "/no-avatar.png";
                    }}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImage}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              {/* Fields */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" name="name" value={form.name} onChange={onChange} required />
                <Input label=" Email" name="email" value={form.email} onChange={onChange} type="email" required />
                <Input label="Phone" name="phone" value={form.phone} onChange={onChange} required />
                <Input label=" License Number" name="licenseNumber" value={form.licenseNumber} onChange={onChange} required />
                <Input label="Experience" name="experienceYears" value={form.experienceYears} onChange={onChange} type="number" />
                
                {/* Specialization */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700"> Specialization</label>
                  <select
                    name="specialization"
                    value={form.specialization || "All"}
                    onChange={onChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg"
                  >
                    <option value="All"> All</option>
                    <option value="Car"> Car</option>
                    <option value="Motorcycle"> Motorcycle</option>
                    <option value="Threewheeler"> Threewheeler</option>
                    <option value="HeavyVehicle"> Heavy Vehicle</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-slate-700">🏠 Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg resize-none"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-slate-700">⚡ Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    <RadioCard label="Active" value="Active" checked={form.status === "Active"} onChange={onChange} active />
                    <RadioCard label="Not Active" value="Not-Active" checked={form.status === "Not-Active"} onChange={onChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t px-8 py-6 flex justify-end gap-3">
            <Link to={`/instructors/${id}`} className="px-6 py-3 bg-white border rounded-lg hover:bg-slate-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Keep contact details accurate</li>
            <li>• Upload a professional photo</li>
            <li>• Choose correct specialization</li>
            <li>• Set status to Active only if available</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---- Small components ---- */
function Input({ label, name, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-slate-700">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg"
      />
    </div>
  );
}

function RadioCard({ label, value, checked, onChange, active }) {
  return (
    <label className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
      checked ? (active ? "border-green-400 bg-green-50" : "border-amber-400 bg-amber-50")
      : "border-slate-200 bg-slate-50 hover:border-slate-300"
    }`}>
      <input type="radio" name="status" value={value} checked={checked} onChange={onChange} className="hidden" />
      <span className="font-medium">{label}</span>
    </label>
  );
}
