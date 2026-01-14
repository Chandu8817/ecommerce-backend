// controllers/payment.controller.ts
import { Response, NextFunction } from "express";

import { AuthRequest } from "../middlewares/auth";
import * as paymentService from "../services/payment.service";
import { Cart } from "../models/Cart";
import { clearCart } from "../services/cart.service";

export const createPaymentOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    const order = await paymentService.createPaymentOrder({
      amount
    })

    res.json(order)
  } catch (error) {
    next(error)
  }
}


// controllers/payment.controller.ts

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("🔔 VERIFY PAYMENT API HIT");   // ✅ MUST PRINT

  try {
    console.log("📦 VERIFY BODY:", req.body);
    console.log("👤 VERIFY USER:", req.user);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    if (!req.user) {
      console.log("❌ NO USER IN REQUEST");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const order = await paymentService.verifyPayment(
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      },
      {
        ...orderData,
        user: req.user.id,
        paymentStatus: "paid",
        paymentMethod: "razorpay"
      }
    );

    if(order.success){

      try{
       await clearCart(req.user.id);
        
      }
      catch(err){console.error("❌ ERROR DELETING CART ITEMS:", err);}
    }

    console.log("✅ ORDER CREATED:", order);

    res.json(order);
  } catch (error) {
    console.error("🔥 VERIFY CONTROLLER ERROR:", error);
    next(error);
  }
};

