import { Router } from "express";
import { googleLogin, updateProfile, getAuthUser, addShippingAddress, getShippingAddress, removeShippingAddress } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router()

// Google Sign-In authentication
router.post("/google", googleLogin);

// User profile
router.post("/update-profile", authMiddleware, updateProfile);

router.get("/me", authMiddleware, getAuthUser);
router.post("/shipping-address", authMiddleware, addShippingAddress);
router.delete("/shipping-address/:id", authMiddleware, removeShippingAddress);
router.get("/shipping-address", authMiddleware, getShippingAddress);


export default router;