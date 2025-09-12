import { Types } from "mongoose";
import { Review } from "../models/Review";
import { AppError } from "../utils/AppError";

export const createReview = async (userId: string, productId: string, rating: number, comment: string) => {
  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId)
  });

  if (existingReview) {
    throw new AppError("REVIEW_EXISTS", "You have already reviewed this product", 400);
  }

  const review = await Review.create({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId),
    rating,
    comment
  });

  return review.populate('userId', 'name email');
};

export const updateReview = async (reviewId: string, userId: string, updates: { rating?: number; comment?: string }) => {
  const review = await Review.findOneAndUpdate(
    { 
      _id: new Types.ObjectId(reviewId),
      userId: new Types.ObjectId(userId)
    },
    { 
      $set: { 
        ...updates,
        updatedAt: new Date()
      } 
    },
    { new: true }
  ).populate('userId', 'name email');

  if (!review) {
    throw new AppError("REVIEW_NOT_FOUND", "Review not found or not authorized", 404);
  }

  return review;
};

export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await Review.findOneAndDelete({
    _id: new Types.ObjectId(reviewId),
    userId: new Types.ObjectId(userId)
  });

  if (!review) {
    throw new AppError("REVIEW_NOT_FOUND", "Review not found or not authorized", 404);
  }

  return { success: true };
};

export const getProductReviews = async (productId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [reviews, total] = await Promise.all([
    Review.find({ productId: new Types.ObjectId(productId) })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ productId: new Types.ObjectId(productId) })
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserReviewForProduct = async (userId: string, productId: string) => {
  const review = await Review.findOne({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId)
  }).populate('userId', 'name email');

  return review;
};
