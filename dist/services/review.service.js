"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReviewForProduct = exports.getProductReviews = exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const mongoose_1 = require("mongoose");
const Review_1 = require("../models/Review");
const AppError_1 = require("../utils/AppError");
const createReview = async (userId, productId, rating, comment) => {
    // Check if user has already reviewed this product
    const existingReview = await Review_1.Review.findOne({
        userId: new mongoose_1.Types.ObjectId(userId),
        productId: new mongoose_1.Types.ObjectId(productId)
    });
    if (existingReview) {
        throw new AppError_1.AppError("REVIEW_EXISTS", "You have already reviewed this product", 400);
    }
    const review = await Review_1.Review.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        productId: new mongoose_1.Types.ObjectId(productId),
        rating,
        comment
    });
    return review.populate('userId', 'name email');
};
exports.createReview = createReview;
const updateReview = async (reviewId, userId, updates) => {
    const review = await Review_1.Review.findOneAndUpdate({
        _id: new mongoose_1.Types.ObjectId(reviewId),
        userId: new mongoose_1.Types.ObjectId(userId)
    }, {
        $set: {
            ...updates,
            updatedAt: new Date()
        }
    }, { new: true }).populate('userId', 'name email');
    if (!review) {
        throw new AppError_1.AppError("REVIEW_NOT_FOUND", "Review not found or not authorized", 404);
    }
    return review;
};
exports.updateReview = updateReview;
const deleteReview = async (reviewId, userId) => {
    const review = await Review_1.Review.findOneAndDelete({
        _id: new mongoose_1.Types.ObjectId(reviewId),
        userId: new mongoose_1.Types.ObjectId(userId)
    });
    if (!review) {
        throw new AppError_1.AppError("REVIEW_NOT_FOUND", "Review not found or not authorized", 404);
    }
    return { success: true };
};
exports.deleteReview = deleteReview;
const getProductReviews = async (productId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
        Review_1.Review.find({ productId: new mongoose_1.Types.ObjectId(productId) })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review_1.Review.countDocuments({ productId: new mongoose_1.Types.ObjectId(productId) })
    ]);
    return {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getProductReviews = getProductReviews;
const getUserReviewForProduct = async (userId, productId) => {
    const review = await Review_1.Review.findOne({
        userId: new mongoose_1.Types.ObjectId(userId),
        productId: new mongoose_1.Types.ObjectId(productId)
    }).populate('userId', 'name email');
    return review;
};
exports.getUserReviewForProduct = getUserReviewForProduct;
