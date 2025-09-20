import express from "express";
import { generateOtp, verifyOtp } from "../controllers/OtpController.js";

const router = express.Router();

// POST /api/otp/generate
router.post("/generate", generateOtp);

// POST /api/otp/verify
router.post("/verify", verifyOtp);

export default router;
