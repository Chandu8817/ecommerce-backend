import { Router } from "express";
import { 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  getCart, 
  clearCart 
} from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Protected routes (require authentication)
router.use(authMiddleware);

router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);
router.get("/", getCart);
router.delete("/", clearCart);

export default router;
