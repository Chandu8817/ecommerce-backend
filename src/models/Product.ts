import mongoose, { Schema, Document, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  stock: number;
  images: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // Reference to User (admin)
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    brand: { type: String },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // e.g., S3 or Cloudinary URLs
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexing for search optimization
productSchema.index({ name: "text", description: "text", category: 1 });

export const Product = model<IProduct>("Product", productSchema);
