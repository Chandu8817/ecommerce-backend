import { Types } from "mongoose";
import { IWishList } from "../models/WishList";
import { WishList } from "../models/WishList";
import { AppError } from "../utils/AppError";

export const addToWishlist = async (userId: string, productId: string) => {
  // Check if product is already in wishlist
  const existingWishlist = await WishList.findOne({ userId });
  
  if (existingWishlist) {
    // Check if product already exists in wishlist
    if (existingWishlist.products.includes(new Types.ObjectId(productId))) {
      throw new AppError("RESOURCE_EXISTS", "Product already in wishlist", 400);
    }
    
    // Add product to existing wishlist
    existingWishlist.products.push(new Types.ObjectId(productId));
    await existingWishlist.save();
    return existingWishlist;
  } else {
    // Create new wishlist
    const wishlist = await WishList.create({
      userId: new Types.ObjectId(userId),
      products: [new Types.ObjectId(productId)]
    });
    return wishlist;
  }
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await WishList.findOne({ userId });
  
  if (!wishlist) {
    throw new AppError("RESOURCE_NOT_FOUND", "Wishlist not found", 404);
  }
  
  const productIndex = wishlist.products.findIndex(
    (p) => p.toString() === productId
  );
  
  if (productIndex === -1) {
    throw new AppError("RESOURCE_NOT_FOUND", "Product not found in wishlist", 404);
  }
  
  wishlist.products.splice(productIndex, 1);
  await wishlist.save();
  
  return wishlist;
};

export const getWishlist = async (userId: string) => {
  const wishlist = await WishList.findOne({ userId })
    .populate('products')
    .lean();
    
  if (!wishlist) {
    return { products: [] };
  }
  
  return wishlist;
};

export const clearWishlist = async (userId: string) => {
  const result = await WishList.deleteOne({ userId });
  return result;
};
