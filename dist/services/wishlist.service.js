"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearWishlist = exports.getWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const mongoose_1 = require("mongoose");
const WishList_1 = require("../models/WishList");
const AppError_1 = require("../utils/AppError");
const addToWishlist = async (userId, productId) => {
    // Check if product is already in wishlist
    const existingWishlist = await WishList_1.WishList.findOne({ userId });
    if (existingWishlist) {
        // Check if product already exists in wishlist
        if (existingWishlist.products.includes(new mongoose_1.Types.ObjectId(productId))) {
            throw new AppError_1.AppError("RESOURCE_EXISTS", "Product already in wishlist", 400);
        }
        // Add product to existing wishlist
        existingWishlist.products.push(new mongoose_1.Types.ObjectId(productId));
        await existingWishlist.save();
        return existingWishlist;
    }
    else {
        // Create new wishlist
        const wishlist = await WishList_1.WishList.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            products: [new mongoose_1.Types.ObjectId(productId)]
        });
        return wishlist;
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (userId, productId) => {
    const wishlist = await WishList_1.WishList.findOne({ userId });
    if (!wishlist) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Wishlist not found", 404);
    }
    const productIndex = wishlist.products.findIndex((p) => p.toString() === productId);
    if (productIndex === -1) {
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found in wishlist", 404);
    }
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    return wishlist;
};
exports.removeFromWishlist = removeFromWishlist;
const getWishlist = async (userId) => {
    const wishlist = await WishList_1.WishList.findOne({ userId })
        .populate('products')
        .lean();
    if (!wishlist) {
        return { products: [] };
    }
    return wishlist;
};
exports.getWishlist = getWishlist;
const clearWishlist = async (userId) => {
    const result = await WishList_1.WishList.deleteOne({ userId });
    return result;
};
exports.clearWishlist = clearWishlist;
