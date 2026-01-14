"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImages = exports.getImages = exports.getImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const s3_1 = require("../config/s3");
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const stream_1 = require("stream");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const uploadImage = async (req, res) => {
    const singleUpload = upload.single("file");
    singleUpload(req, res, async (err) => {
        if (err)
            return res.status(400).json({ error: "File upload error" });
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        try {
            const file = req.file;
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = `${crypto_1.default.randomUUID()}${fileExt}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            await s3_1.s3Client.send(command);
            const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            res.status(200).json({ url: imageUrl });
        }
        catch (error) {
            console.error("S3 Upload Error:", error);
            res.status(500).json({ error: "Failed to upload image" });
        }
    });
};
exports.uploadImage = uploadImage;
const uploadMultipleImages = async (req, res) => {
    const multiUpload = upload.array("files", 10); // 👈 must match your form field name
    multiUpload(req, res, async (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ error: "File upload error", details: err.message });
        }
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        try {
            const uploadPromises = files.map(async (file) => {
                const fileExt = path_1.default.extname(file.originalname).toLowerCase();
                const fileName = `${crypto_1.default.randomUUID()}${fileExt}`;
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    CacheControl: "public, max-age=31536000",
                });
                await s3_1.s3Client.send(command);
                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            });
            const imageUrls = await Promise.all(uploadPromises);
            return res.status(200).json({ urls: imageUrls });
        }
        catch (error) {
            console.error("S3 Upload Error:", error);
            return res.status(500).json({ error: "Failed to upload images" });
        }
    });
};
exports.uploadMultipleImages = uploadMultipleImages;
const getImage = async (req, res) => {
    try {
        const { key } = req.params;
        console.log("getImage called with key:", key);
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });
        const data = await s3_1.s3Client.send(command);
        // Set content type
        if (data.ContentType)
            res.setHeader("Content-Type", data.ContentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Content-Type", data.ContentType || "image/jpeg");
        // Handle different Body types
        if (data.Body instanceof stream_1.Readable) {
            // ✅ Stream directly if it's a Node stream
            data.Body.pipe(res);
        }
        else if (data.Body && typeof data.Body.transformToByteArray === "function") {
            // ✅ For SDKs returning Web streams (like in ESM builds)
            const bytes = await data.Body.transformToByteArray();
            res.send(Buffer.from(bytes));
        }
        else {
            // ❌ Fallback: unknown type
            console.error("Unexpected Body type:", typeof data.Body);
            res.status(500).json({ error: "Unexpected S3 Body type" });
        }
    }
    catch (err) {
        console.error("S3 fetch error:", err);
        if (err.name === "NoSuchKey") {
            return res.status(404).json({ error: "File not found" });
        }
        res.status(500).json({ error: "Error fetching image" });
    }
};
exports.getImage = getImage;
const getImages = async (req, res) => {
    try {
        const bucketName = process.env.AWS_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        // Get all objects from S3 bucket
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: bucketName,
        });
        const data = await s3_1.s3Client.send(command);
        if (!data.Contents || data.Contents.length === 0) {
            return res.status(200).json({ data: [] });
        }
        // Generate public URLs (assuming your bucket or objects are public)
        const urls = data.Contents.map((item) => `https://${bucketName}.s3.${region}.amazonaws.com/${item.Key}`);
        res.status(200).json({ count: urls.length, data: urls });
    }
    catch (error) {
        console.error("Error fetching S3 images:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.getImages = getImages;
const deleteImages = async (req, res) => {
    try {
        const { keys } = req.body;
        console.log("deleteImages called with keys:", keys);
        // Split the keys string into an array
        const keysArray = keys;
        // Delete each key one by one
        const deletePromises = keysArray.map((key) => {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key.trim(), // Trim any whitespace
            });
            return s3_1.s3Client.send(command);
        });
        // Wait for all deletions to complete
        await Promise.all(deletePromises);
        res.status(200).json({ message: "Images deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting S3 images:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteImages = deleteImages;
