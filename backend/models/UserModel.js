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

    isVerified:{
      type: Boolean,
      default: false
    },

    verificationToken: {
      type: String
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    role: { 
      type: String, 
      enum: ["Student", "Instructor", "Admin"], 
      default: "Student"  // sensible default
    }
    },
  },

  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;