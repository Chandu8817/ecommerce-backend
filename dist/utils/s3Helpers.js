"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesToS3 = void 0;
// utils/s3Helpers.ts
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = require("../config/s3");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const uploadFilesToS3 = async (files) => {
    const keys = await Promise.all(files.map(async (file) => {
        const ext = path_1.default.extname(file.originalname);
        const key = `${crypto_1.default.randomUUID()}${ext}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: "public, max-age=31536000",
        });
        await s3_1.s3Client.send(command);
        return key;
    }));
    return keys;
};
exports.uploadFilesToS3 = uploadFilesToS3;
