import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import inquiryRoutes from "./routes/inquiryroutes.js";
import maintenanceRoutes from "./routes/maintenanceroutes.js";
import reportRoutes from "./routes/reportroutes.js";
import authRoutes from "./routes/authRoutes.js";   // this is fine

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
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
  .catch((err) => console.error("❌ MongoDB connection error:", err));
