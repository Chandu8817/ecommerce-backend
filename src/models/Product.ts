import mongoose, { Schema, Document, model, Types } from "mongoose";

type Gender = "male" | "female" | "other"

export interface IHighlight {
  title: string;
  description: string;
  image?: string;
}

export interface IColor {
  name: string;
  code?: string;
  image?: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string[];
  sku?: string;
  brand?: string;
  stock: number;
  images: string[];
  isActive: boolean;
  ageGroup: string;
  gender: Gender;
  featured?: boolean;
  isNFT?: boolean;
  sizes?: string[];
  colors?: IColor[];
  features?: string[];
  highlights?: IHighlight[];
  originalPrice?: number;
  discount?: number;
  material?: string;
  reviewCount?: number;
  createdBy: Types.ObjectId; // Reference to User (admin)
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
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
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
  },
  { timestamps: true }
);

// Indexing for search optimization
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });

export const Product = model<IProduct>("Product", productSchema);
