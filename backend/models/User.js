import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true }, // same as instructorId (A001, A002…)
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "instructor" },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;