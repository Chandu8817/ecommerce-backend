import { Router } from "express";
import { 
  createReview, 
  updateReview, 
  deleteReview, 
  getProductReviews,
  getUserReview
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes (require authentication)
router.use(authMiddleware);

router.post("/product/:productId", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.get("/product/:productId/user/:userId", getUserReview);

export default router;
