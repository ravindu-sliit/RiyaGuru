import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

import instructorRoutes from "./route/instructorRoutes.js";
import vehicleRoutes from "./route/vehicleRoutes.js";
import bookingRoutes from "./route/bookingRoutes.js";
import lessonProgressRoutes from "./route/lessonProgressRoutes.js"; 
import authRoutes from "./route/authRoutes.js";


dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// ✅ Fix: Allow Express to serve files from /uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/lesson-progress", lessonProgressRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running 🚀 on port ${PORT} and connected to MongoDB`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
