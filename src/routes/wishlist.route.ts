import { Router } from "express";
import { 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist, 
  clearWishlist 
} from "../controllers/wishlist.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Protected routes (require authentication)
router.use(authMiddleware);

router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.get("/", getWishlist);
router.delete("/", clearWishlist);

export default router;
