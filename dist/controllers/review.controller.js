"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReview = exports.getProductReviews = exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const reviewService = __importStar(require("../services/review.service"));
const createReview = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const review = await reviewService.createReview(req.user.id, productId, rating, comment);
        res.json(review);
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
const updateReview = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const review = await reviewService.updateReview(reviewId, req.user.id, { rating, comment });
        res.json(review);
    }
    catch (error) {
        next(error);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { reviewId } = req.params;
        const review = await reviewService.deleteReview(reviewId, req.user.id);
        res.json(review);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
const getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getProductReviews(productId, req.query.page);
        res.json(reviews);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductReviews = getProductReviews;
const getUserReview = async (req, res, next) => {
    try {
        const { productId, userId } = req.params;
        const reviews = await reviewService.getUserReviewForProduct(userId, productId);
        res.json(reviews);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserReview = getUserReview;
