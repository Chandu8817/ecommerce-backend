import mongoose, { Schema, Document, model, Types } from "mongoose";
import { Category } from "./Category";
import { features } from "process";
 type Gender ="male"|"female" | "other"
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  sku?: string;
  brand?: string;
  stock: number;
  images: string[];
  isActive: boolean;
  ageGroup:string;
  gender :Gender;
  featured?: boolean;
  isNFT?: boolean;
  sizes?: string[];
  createdBy: Types.ObjectId; // Reference to User (admin)
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    sku: { type: String, unique: true, sparse: true },
    brand: { type: String },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // e.g., S3 or Cloudinary URLs
    isActive: { type: Boolean, default: true },
    ageGroup: {type:String, index: true},
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, default: Date.now },
    gender: {type:String,enum:["Boys","Girls","other"],default:"other"},
    featured: { type: Boolean, default: false, index: true },
    isNFT: { type: Boolean, default: false, index: true },
    sizes: [{ type: String }],

  },
  { timestamps: true }
);

// Indexing for search optimization
productSchema.index({ name: "text", description: "text", category: 1,featured:1 });
productSchema.index({ price: 1 });

export const Product = model<IProduct>("Product", productSchema);
