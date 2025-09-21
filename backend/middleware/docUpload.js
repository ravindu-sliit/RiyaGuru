import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Make __dirname work in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Always save to backend/uploads/studentDocs
const dest = path.join(__dirname, "..", "uploads", "studentDocs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const finalName = `${base}_${ts}${ext}`;
    cb(null, finalName);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Accept both NIC and DL fields (each has front/back)
const docUpload = upload.fields([
  { name: "nicFront", maxCount: 1 },
  { name: "nicBack",  maxCount: 1 },
  { name: "dlFront",  maxCount: 1 },
  { name: "dlBack",   maxCount: 1 },
]);

export default docUpload;
