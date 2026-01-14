import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller";

const router = Router();

router.post("/create", authMiddleware, createPaymentOrder);
router.post(
  "/verify",
  (req, _res, next) => {
    console.log("➡️ /payment/verify ROUTE HIT");
    next();
  },
  authMiddleware,
  verifyPayment
);

export default router;


