// backend/server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

// routes
import paymentRoutes from "./route/paymentRoutes.js";
import installmentRoutes from "./route/installmentRoutes.js";
import adminPaymentRoutes from "./route/adminPaymentRoutes.js";
import receiptRoutes from "./route/receiptRoutes.js";
import authRoutes from "./route/authRoutes.js";   // already in your project

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/payments", paymentRoutes);           // student CRUD
app.use("/api/installments", installmentRoutes);   // installment plans
app.use("/api/admin/payments", adminPaymentRoutes); // admin approve/reject
app.use("/api/receipts", receiptRoutes);           // receipt downloads
app.use("/api/auth", authRoutes);                  // login/auth

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running 🚀 on port ${PORT} and connected to MongoDB`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
