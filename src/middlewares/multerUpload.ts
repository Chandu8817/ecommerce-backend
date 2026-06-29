// middlewares/multerUpload.ts
import multer from "multer";

// Keep files in memory so we can stream the buffer straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

export const uploadAny = upload.any(); // Accept any files (bulk)
export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);

export default upload;
