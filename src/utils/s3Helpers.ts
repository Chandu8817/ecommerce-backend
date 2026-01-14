// utils/s3Helpers.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3";
import crypto from "crypto";
import path from "path";
import { Express } from "express";

export const uploadFilesToS3 = async (files: Express.Multer.File[]) => {
  const keys = await Promise.all(
    files.map(async (file) => {
      const ext = path.extname(file.originalname);
      const key = `${crypto.randomUUID()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: "public, max-age=31536000",
      });

      await s3Client.send(command);
      return key;
    })
  );

  return keys;
};
