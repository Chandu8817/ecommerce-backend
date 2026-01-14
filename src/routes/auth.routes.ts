import { Router } from "express";
import { requestOTP, verifyOTP, updateProfile, getAuthUser, addShippingAddress, getShippingAddress, removeShippingAddress } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router()

// OTP-based authentication (new flow)
router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);

// User profile
router.post("/update-profile", authMiddleware, updateProfile);

router.get("/me", authMiddleware, getAuthUser);
router.post("/shipping-address", authMiddleware, addShippingAddress);
router.delete("/shipping-address/:id", authMiddleware, removeShippingAddress);
router.get("/shipping-address", authMiddleware, getShippingAddress);


export default router;