import { Router } from "express";
import { register, login,getAuthUser, addShippingAddress,getShippingAddress,removeShippingAddress } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router()

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware,getAuthUser);
router.post("/shipping-address", authMiddleware,addShippingAddress);
router.delete("/shipping-address/:id", authMiddleware,removeShippingAddress);
router.get("/shipping-address", authMiddleware,getShippingAddress);

export default router;