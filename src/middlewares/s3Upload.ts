// middlewares/s3Upload.ts
import multer from "multer";
import { Request, Response, NextFunction } from "express";

const upload = multer({ storage: multer.memoryStorage() });

export const s3Multiple = upload.any(); // Accept any files for bulk

