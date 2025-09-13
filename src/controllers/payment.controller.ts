// controllers/payment.controller.ts
import { Response,NextFunction } from "express";

import { AuthRequest } from "../middleware/auth";
import * as paymentService from "../services/payment.service";
import { Cart } from "../models/Cart";

export const createPaymentOrder = async (req: AuthRequest, res: Response,next:NextFunction) => {
    console.log(req.body);
  const { amount } = req.body;
  console.log(amount);
  try {
    const order = await paymentService.createPaymentOrder({amount});
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// controllers/payment.controller.ts

export const verifyPayment = async (req: AuthRequest, res: Response,next:NextFunction) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

  const order = await paymentService.verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,},orderData);

    if(!order){
        return res.status(400).json({message:"Invalid payment signature"});
    }
    await Cart.deleteMany({user:orderData.user._id});

  res.json(order);
};
