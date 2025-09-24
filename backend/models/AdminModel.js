// models/AdminModel.js
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    unique: true,
    required: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
