import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      unique: true, 
      required: true  // ensures every user has a unique ID
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
    role: { 
      type: String, 
      enum: ["Student", "Instructor", "Admin"], 
      default: "Student"  // sensible default
    },
    instructorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Instructor" 
    }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;