import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import instructorRoutes from "./route/instructorRoutes.js";
import vehicleRoutes from "./route/vehicleRoutes.js";
import bookingRoutes from "./route/bookingRoutes.js";
import lessonProgressRoutes from "./route/lessonProgressRoutes.js"; 
import authRoutes from "./route/authRoutes.js";
import studentRoutes from "./route/StudentRoute.js";
import progressTrackingRoutes from "./route/progressTrackingRoutes.js";
import userRoutes from "./route/UserRoute.js";
import preferenceRoutes from "./route/PreferenceRoute.js";
import courseRoutes from "./route/courseRoutes.js";
import studentCourseRoutes from "./route/StudentCourseRoute.js";
import otpRoutes from "./route/OtpRoute.js";
import paymentRoutes from "./route/paymentRoutes.js";
import installmentRoutes from "./route/installmentRoutes.js";
import receiptRoutes from "./route/receiptRoutes.js";
import certificateRoutes from "./route/certificateRoutes.js";





// Import routes
import inquiryRoutes from "./routes/inquiryroutes.js";
import maintenanceRoutes from "./routes/maintenanceroutes.js";
import reportRoutes from "./routes/reportroutes.js";


dotenv.config();
const app = express();

// Middleware
app.use(express.json());


// Routes
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/payments", paymentRoutes); 
app.use("/api/installments", installmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptRoutes);

// ✅ Allow Express to serve uploaded files (instructors, etc.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Test route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Routes

app.use("/api/instructors", instructorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/lesson-progress", lessonProgressRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/progress-tracking", progressTrackingRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/preferences", preferenceRoutes);
app.use("/api/certificates", certificateRoutes);

app.use("/api/courses", courseRoutes);
app.use("/api/studentcourses", studentCourseRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/reports", reportRoutes);



// ✅ Global error handler (handles Multer/file upload errors too)
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: err.message });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} and connected to MongoDB`)
    );
  })

  .catch((err) => console.error("MongoDB connection error:", err));




