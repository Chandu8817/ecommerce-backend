// controllers/uploadController.ts
import { Request, Response } from "express";

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    res.status(200).json({ message: "Images uploaded successfully", urls });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload images" });
  }
};
