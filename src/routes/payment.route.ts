import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/create", authMiddleware, createPaymentOrder);
router.post("/verify", authMiddleware, verifyPayment);
export default router;


