import mongoose from "mongoose";
import { IProduct, Product } from "../models/Product";
import { AppError } from "../utils/AppError";

export const addProduct = async (productInput: Partial<IProduct>) => {
  const product = await Product.create(productInput);
  return product;
};
export const addProducts = async (productsInput: Partial<IProduct>[]) => {
  const products = await Product.insertMany(productsInput);
  return products;
};

export const getProduct = async (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("INVALID_ID", "Invalid product ID", 400, [
      { field: "productId", issue: "Must be a valid ObjectId" },
    ]);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }

  return product;
};

export const getProducts = async (take: number, skip: number) => {
  const products = await Product.find().skip(skip).limit(take);
  if (!products || products.length === 0) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }
  return products;
};

export const filterProducts = async (filter: any) => {
  const { category, brand, price, stock, createdAt, isActive, take, skip } =
    filter;
  const query: any = {};
  if (category) query.category = { $in: category };

  if (brand) query.brand = brand;
  
  if (isActive !== undefined) query.isActive = isActive;
  if (price) {
    query.price = {};
    if (price.min !== undefined) query.price.$gte = price.min;
    if (price.max !== undefined) query.price.$lte = price.max;
  }

  if (stock) {
    query.stock = {};
    if (stock.min !== undefined) query.stock.$gte = stock.min;
    if (stock.max !== undefined) query.stock.$lte = stock.max;
  }

  if (createdAt) {
    query.createdAt = {};
    if (createdAt.from) query.createdAt.$gte = new Date(createdAt.from);
    if (createdAt.to) query.createdAt.$lte = new Date(createdAt.to);
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .skip(skip || 0)
      .limit(take || 10),
    Product.countDocuments(query),
  ]);
  return [products, total];
};
