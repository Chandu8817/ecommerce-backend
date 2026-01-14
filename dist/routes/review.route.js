"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/product/:productId", review_controller_1.getProductReviews);
// Protected routes (require authentication)
router.use(auth_1.authMiddleware);
router.post("/product/:productId", review_controller_1.createReview);
router.put("/:reviewId", review_controller_1.updateReview);
router.delete("/:reviewId", review_controller_1.deleteReview);
router.get("/product/:productId/user/:userId", review_controller_1.getUserReview);
exports.default = router;
