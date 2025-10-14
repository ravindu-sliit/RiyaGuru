import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import vehicleAPI from "../../api/vehicleApi";
import { ArrowLeft, Save, Upload, X, Car } from "lucide-react";
import { toast } from "react-toastify";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    regNo: "",
    model: "",
    brand: "",
    type: "",
    year: new Date().getFullYear(),
    fuelType: "",
    mileage: 0,
    status: "Not-Active",
    lastServiceDate: "",
    nextServiceDue: "",
    assignedInstructor: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  // field-level validation
  const validateField = (name, value) => {
    switch (name) {
      case "regNo":
        if (!value.trim()) return "Registration number is required";
        break;
      case "brand":
        if (!value.trim()) return "Brand is required";
        break;
      case "model":
        if (!value.trim()) return "Model is required";
        break;
      case "type":
        if (!value) return "Vehicle type is required";
        break;
      case "fuelType":
        if (!value) return "Fuel type is required";
        break;
      case "year":
        if (value < 1990 || value > new Date().getFullYear() + 1)
          return "Please enter a valid year";
        break;
      case "mileage":
        if (value < 0) return "Mileage cannot be negative";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // live validation
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const msg = validateField(key, value);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") fd.append(key, value);
      });

      await vehicleAPI.create(fd);
      toast.success("Vehicle added successfully!");
      navigate("/admin/vehicles");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add vehicle");
      console.error("Error creating vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-white/40 bg-white/50 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
          <Car className="text-orange-500 w-6 h-6" />
          <span>RiyaGuru.lk</span>
        </div>
       
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate("/admin/vehicles")}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-600 hover:border-orange-500 hover:text-orange-500 transition mb-4"
        >
          <ArrowLeft size={16} /> Back to Vehicles
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
          <p className="text-gray-500 text-sm">
            Add a new vehicle to your driving school fleet
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md shadow-sm overflow-hidden grid md:grid-cols-3"
        >
          {/* Main Form */}
          <div className="p-6 md:col-span-2 border-r border-white/30">
            {/* Basic Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleInputChange}
                    placeholder="ABC-1234"
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.regNo ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  />
                  {errors.regNo && (
                    <p className="text-xs text-red-500 mt-1">{errors.regNo}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Honda, Toyota, etc."
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.brand ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  />
                  {errors.brand && (
                    <p className="text-xs text-red-500 mt-1">{errors.brand}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Civic, Aqua, etc."
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.model ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500 mt-1">{errors.model}</p>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.year ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  />
                  {errors.year && (
                    <p className="text-xs text-red-500 mt-1">{errors.year}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vehicle Specifications
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.type ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="ThreeWheeler">Three Wheeler</option>
                    <option value="HeavyVehicle">Heavy Vehicle</option>
                  </select>
                  {errors.type && (
                    <p className="text-xs text-red-500 mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.fuelType ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                  {errors.fuelType && (
                    <p className="text-xs text-red-500 mt-1">{errors.fuelType}</p>
                  )}
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    min="0"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-3 py-2 border rounded-md text-sm bg-white/70 backdrop-blur-sm ${
                      errors.mileage ? "border-red-400" : "border-white/40"
                    } focus:ring-2 focus:ring-orange-300`}
                  />
                  {errors.mileage && (
                    <p className="text-xs text-red-500 mt-1">{errors.mileage}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-md text-sm focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Not-Active">Not Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-md text-sm focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Service Due
                  </label>
                  <input
                    type="date"
                    name="nextServiceDue"
                    value={formData.nextServiceDue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/40 bg-white/70 backdrop-blur-sm rounded-md text-sm focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="p-6 flex flex-col">
            {/* Image Upload */}
            <div className="mb-6 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Vehicle Image
              </h3>
              <div>
                {imagePreview ? (
                  <div className="relative border border-white/40 rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Vehicle preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black/90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("image").click()}
                    className="border-2 border-dashed border-white/50 bg-white/40 backdrop-blur-sm rounded-md p-6 text-center cursor-pointer hover:bg-white/60"
                  >
                    <Upload className="mx-auto text-gray-400 w-10 h-10 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="text-orange-500 font-medium">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Add Vehicle
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/vehicles")}
                disabled={loading}
                className="w-full py-2 px-4 rounded-md border border-white/40 bg-white/70 backdrop-blur-sm text-gray-700 font-medium text-sm hover:bg-white/80 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
