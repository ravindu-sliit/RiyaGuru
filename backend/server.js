import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import paymentRoutes from "./route/paymentRoutes.js";
import installmentRoutes from "./route/installmentRoutes.js";
import authRoutes from "./route/authRoutes.js";
import receiptRoutes from "./route/receiptRoutes.js";




dotenv.config();
const app = express();

// Middleware
app.use(express.json());

app.use("/api/payments", paymentRoutes); 
app.use("/api/installments", installmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Start server only after MongoDB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running 🚀 on port ${PORT} and connected to MongoDB`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));



