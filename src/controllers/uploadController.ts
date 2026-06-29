import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { uploadAny } from "../middlewares/multerUpload";
import {
  uploadBufferToCloudinary,
  uploadFilesToCloudinary,
  extractPublicId,
} from "../utils/cloudinaryHelpers";

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "ecommerce";

export const uploadImage = async (req: Request, res: Response) => {
  uploadAny(req, res, async (err) => {
    if (err) return res.status(400).json({ error: "File upload error" });

    const files = (req.files as Express.Multer.File[]) || [];
    const file = files.find((f) => f.fieldname === "file") || files[0];
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const result = await uploadBufferToCloudinary(file);
      res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
};

export const uploadMultipleImages = async (req: Request, res: Response) => {
  uploadAny(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res
        .status(400)
        .json({ error: "File upload error", details: err.message });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const imageUrls = await uploadFilesToCloudinary(files);
      return res.status(200).json({ urls: imageUrls });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload images" });
    }
  });
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: CLOUDINARY_FOLDER,
      max_results: 500,
    });

    const urls = (result.resources || []).map((item: any) => item.secure_url);

    res.status(200).json({ count: urls.length, data: urls });
  } catch (error: any) {
    console.error("Error fetching Cloudinary images:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteImages = async (req: Request, res: Response) => {
  try {
    const { keys } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return res
        .status(400)
        .json({ error: "Provide an array of image URLs or public_ids in 'keys'" });
    }

    const publicIds = keys.map((key: string) => extractPublicId(key));

    await Promise.all(
      publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
    );

    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting Cloudinary images:", error);
    res.status(500).json({ error: error.message });
  }
};
