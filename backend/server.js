import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import lessonProgressRoutes from "./route/lessonProgressRoutes.js";
import progressTrackingRoutes from "./route/progressTrackingRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/lesson-progress", lessonProgressRoutes);
app.use("/api/progress-tracking", progressTrackingRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Start server only after MongoDB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running 🚀 on port ${PORT} and connected to MongoDB`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));