import { Request, Response } from "express";
import { s3Client } from "../config/s3";
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadImage = async (req: Request, res: Response) => {
  const singleUpload = upload.single("file");

  singleUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: "File upload error" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${crypto.randomUUID()}${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      res.status(200).json({ url: imageUrl });
    } catch (error) {
      console.error("S3 Upload Error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
};

export const uploadMultipleImages = async (req: Request, res: Response) => {
  const multiUpload = upload.array("files", 10); // 👈 must match your form field name

  multiUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: "File upload error", details: err.message });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        const fileName = `${crypto.randomUUID()}${fileExt}`;

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: "public, max-age=31536000",
        });

        await s3Client.send(command);

        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      });

      const imageUrls = await Promise.all(uploadPromises);
      return res.status(200).json({ urls: imageUrls });
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return res.status(500).json({ error: "Failed to upload images" });
    }
  });
};
export const getImage = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    console.log("getImage called with key:", key);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const data = await s3Client.send(command);

    // Set content type
    if (data.ContentType) res.setHeader("Content-Type", data.ContentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Type", data.ContentType || "image/jpeg");
    // Handle different Body types
    if (data.Body instanceof Readable) {
      // ✅ Stream directly if it's a Node stream
      data.Body.pipe(res);
    } else if (data.Body && typeof (data.Body as any).transformToByteArray === "function") {
      // ✅ For SDKs returning Web streams (like in ESM builds)
      const bytes = await (data.Body as any).transformToByteArray();
      res.send(Buffer.from(bytes));
    } else {
      // ❌ Fallback: unknown type
      console.error("Unexpected Body type:", typeof data.Body);
      res.status(500).json({ error: "Unexpected S3 Body type" });
    }
  } catch (err: any) {
    console.error("S3 fetch error:", err);
    if (err.name === "NoSuchKey") {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(500).json({ error: "Error fetching image" });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;


    // Get all objects from S3 bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });
    const data = await s3Client.send(command);

    if (!data.Contents || data.Contents.length === 0) {
      return res.status(200).json({ data: [] });
    }

    // Generate public URLs (assuming your bucket or objects are public)
    const urls = data.Contents.map(
      (item:any) => `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`
    );

    res.status(200).json({ count: urls.length, data: urls });
  } catch (error: any) {
    console.error("Error fetching S3 images:", error);
    res.status(500).json({ error: error.message });
  }


};

export const deleteImages = async (req: Request, res: Response) => {
  try {
    const { keys } = req.body;
    console.log("deleteImages called with keys:", keys);
    
    // Split the keys string into an array
    const keysArray = keys
    
    // Delete each key one by one
    const deletePromises = keysArray.map((key:string) => {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key.trim(), // Trim any whitespace
      });
      return s3Client.send(command);
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    res.status(200).json({ message: "Images deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting S3 images:", error);
    res.status(500).json({ error: error.message });
  }
};
