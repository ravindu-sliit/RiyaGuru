import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { // matches Student/Instructor/Admin ID
    type: String,
    unique: true,
    required: true
  },
  role: { // auto-determined from ID prefix
    type: String,
    enum: ["Student", "Instructor", "Admin"],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

const User = mongoose.model("User", userSchema);
export default User;
