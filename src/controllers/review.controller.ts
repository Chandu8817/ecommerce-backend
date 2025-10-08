import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../utils/AppError";
import * as reviewService from "../services/review.service";

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});  
        const {productId} = req.params;
        const {rating, comment} = req.body;
        const review = await reviewService.createReview(req.user.id,productId, rating, comment);
        res.json(review);
    } catch (error) {
        next(error);
    }
}

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});  
        const {reviewId} = req.params;
 
        const {rating, comment} = req.body;
        const review = await reviewService.updateReview(reviewId,req.user.id, {rating, comment});
        res.json(review);
    } catch (error) {
        next(error);
    }
}

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});  
        const {reviewId} = req.params;
        const review = await reviewService.deleteReview(reviewId, req.user.id);
        res.json(review);
    } catch (error) {
        next(error);
    }
}

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {productId} = req.params;
        const reviews = await reviewService.getProductReviews(productId, req.query.page as unknown as number);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
}

export const getUserReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {productId,userId} = req.params;
        const reviews = await reviewService.getUserReviewForProduct(userId, productId);
        res.json(reviews);
    } catch (error) {
        next(error);
    }
}
