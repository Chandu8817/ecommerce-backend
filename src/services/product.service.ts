import mongoose, { Types } from "mongoose";
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

export const getProducts = async (take: number, skip: number, featured: boolean) => {
  let products
  if (featured) {
    products = await Product.find({ featured: featured }).skip(skip).limit(take);
  } else {
    products = await Product.find().skip(skip).limit(take);
  }

  if (!products || products.length === 0) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }
  return products;
};

interface FilterOptions {
  category?: string[];
  ageGroup?: string[];
  gender?: string;
  brand?: string;
  price?: { min?: number; max?: number };
  stock?: { min?: number; max?: number };
  createdAt?: { from?: string; to?: string };
  isActive?: boolean;
  take?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean,
  isNFT?: boolean;
  sizes?: string[];
}

export const filterProducts = async (filter: FilterOptions) => {
  const {
    category,
    ageGroup,
    gender,
    brand,
    price,
    stock,
    createdAt,
    isActive,
    take,
    skip,
    sortBy,
    sortOrder,
    featured,
    isNFT,
    sizes,
  } = filter;

  const query: any = {};

  if (featured) query.featured = { $in: featured }
  if (category) query.category = { $in: category };
  if (gender) query.gender = gender;
  if (ageGroup) query.ageGroup = { $in: ageGroup };
  if (brand) query.brand = brand;
  if (sizes) query.sizes = { $in: sizes };
  if (isNFT !== undefined) query.isNFT = isNFT;


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

  // Build sort object if sortBy is provided
  const sortOptions: Record<string, 1 | -1> = {};
  if (sortBy) {
    if (sortBy === "price-low") {
      sortOptions.price = 1;  // ascending
    } else if (sortBy === "price-high") {
      sortOptions.price = -1; // descending
    } else {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    }
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOptions)
      .skip(skip || 0)
      .limit(take || 10)
      .lean(),
    Product.countDocuments(query),
  ]);

  return [products, total];
};

export const updateProduct = async (id: string, productInput: Partial<IProduct>) => {
  const product = await Product.findByIdAndUpdate(id, productInput, { new: true });
  if (!product) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }
  return product;
};

export const getTotalCount = async () => {
  const count = await Product.countDocuments();
  return count;
};

export const updateProducts = async (ids: string[], productInput: Partial<IProduct>) => {
  const products = await Product.updateMany({ _id: { $in: ids } }, productInput);
  return products;
};

export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }
  return product;
};

export const deleteProducts = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found", 404, [
      { field: "productId", issue: "Does not exist in database" },
    ]);
  }
  const product_ids = ids.map(id => new Types.ObjectId(id));
  const products = await Product.deleteMany({ _id: { $in: product_ids } });
  return products;
};

export const getLastUpdated = async () => {
  const latest = await Product.findOne().sort({ updatedAt: -1 }).select('updatedAt');
  return latest?.updatedAt || new Date(0);
};