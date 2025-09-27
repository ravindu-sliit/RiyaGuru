import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Ensure uploads/slips exists relative to backend root (same as server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads", "slips");
fs.mkdirSync(uploadDir, { recursive: true });

// Storage config: save original extension, unique name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// Accept only jpg/jpeg/png/pdf
const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const fileFilter = (req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only jpg, png, or pdf files are allowed"));
};

// 20MB limit
const limits = { fileSize: 20 * 1024 * 1024 };

const paymentSlipUpload = multer({ storage, fileFilter, limits });

export default paymentSlipUpload;
