import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";

// -----------------------------
// Route imports
// -----------------------------
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
import docRoutes from "./route/DocRoute.js";

import adminPaymentRoutes from "./route/adminPaymentRoutes.js";
import adminRoutes from "./route/AdminRoutes.js"; 

// -----------------------------
// Routes (plural folder)
// -----------------------------
import inquiryRoutes from "./route/inquiryroutes.js";
import maintenanceRoutes from "./route/maintenanceroutes.js"; 
import publicReportRoutes from "./route/reportroutes.js";
import progressReportRoutes from "./route/progressReportRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Ensure uploads folders exist
// -----------------------------
const uploadsDir = path.join(__dirname, "uploads");
const studentDocsDir = path.join(uploadsDir, "studentDocs");
const instructorDir = path.join(uploadsDir, "instructors");

fs.mkdirSync(studentDocsDir, { recursive: true });
fs.mkdirSync(instructorDir, { recursive: true });

// -----------------------------
// Core middleware
// -----------------------------
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    // ✅ allow frontend to read Content-Disposition header (needed for filename)
    exposedHeaders: ["Content-Disposition"],
  })
);

// -----------------------------
// Serve static uploads
// -----------------------------
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads/receipts", express.static(path.join(uploadsDir, "receipts")));

// -----------------------------
// Health route
// -----------------------------
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// -----------------------------
// API Routes
// -----------------------------
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/maintenance", maintenanceRoutes); // ✅ includes your new /pdf endpoint
app.use("/api/reports", publicReportRoutes);
app.use("/api/progress-reports", progressReportRoutes);
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
app.use("/api/docs", docRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/installments", installmentRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admins", adminRoutes);

// -----------------------------
// Global error handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err);
  const msg = err?.message || "Internal Server Error";
  res.status(500).json({ message: msg });
});

// -----------------------------
// Mongo connection + server start
// -----------------------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} and connected to MongoDB`);
      console.log(`📁 Serving uploads from: ${uploadsDir}`);
      console.log(
        `🌐 Example: http://localhost:${PORT}/uploads/instructors/<your-file>.jpg`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
