import multer from "multer";
import { BadRequestError } from "../utils/errors.js";

// Keep files in memory rather than writing to disk directly
const storage = multer.memoryStorage();

// Validate mimetype
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.") as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});
