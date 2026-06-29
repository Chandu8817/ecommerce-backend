// utils/cloudinaryHelpers.ts
import { Express } from "express";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "ecommerce";

/**
 * Upload a single in-memory file buffer to Cloudinary.
 */
export const uploadBufferToCloudinary = (
  file: Express.Multer.File
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

/**
 * Upload many files and return their public (secure) URLs.
 */
export const uploadFilesToCloudinary = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const results = await Promise.all(files.map(uploadBufferToCloudinary));
  return results.map((result) => result.secure_url);
};

/**
 * Derive a Cloudinary public_id from either a full delivery URL or a raw
 * public_id. Lets callers delete by URL (what we now store) or by id.
 */
export const extractPublicId = (urlOrId: string): string => {
  const value = urlOrId.trim();

  if (!value.startsWith("http")) {
    return value;
  }

  // .../upload/v1234567890/folder/name.jpg -> folder/name
  const match = value.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return value;

  const withoutExt = match[1].replace(/\.[^/.]+$/, "");
  return withoutExt;
};
