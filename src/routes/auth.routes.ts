import { Router } from "express";
import { register, login,getAuthUser, addShippingAddress,getShippingAddress } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router()

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware,getAuthUser);
router.post("/shipping-address", authMiddleware,addShippingAddress);
router.get("/shipping-address", authMiddleware,getShippingAddress);

export default router;