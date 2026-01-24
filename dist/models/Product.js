"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, min: 0 },
    category: [{ type: String, required: true, index: true }],
    sku: { type: String, unique: true, sparse: true },
    brand: { type: String },
    material: { type: String },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // e.g., S3 or Cloudinary URLs
    isActive: { type: Boolean, default: true },
    ageGroup: { type: String, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, default: Date.now },
    gender: { type: String, enum: ["Boys", "Girls", "other"], default: "other" },
    featured: { type: Boolean, default: false, index: true },
    isNFT: { type: Boolean, default: false, index: true },
    sizes: [{ type: String }],
    reviewCount: { type: Number, default: 0, min: 0 },
    // New fields for enhanced product details
    colors: [
        {
            name: { type: String },
            code: { type: String },
            image: { type: String }
        }
    ],
    features: [{ type: String }], // Array of feature descriptions
    highlights: [
        {
            title: { type: String },
            description: { type: String },
            image: { type: String }
        }
    ]
}, { timestamps: true });
// Indexing for search optimization
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
