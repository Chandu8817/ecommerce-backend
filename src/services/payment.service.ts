// controllers/payment.controller.ts
import crypto from "crypto";
import { IOrder, Order } from "../models/Order";
import { razorpay } from "../utils/razorpay";
import { AppError } from "../utils/AppError";

interface IPaymentInput {
    amount: number;
    currency?: string;
  }
interface IPaymentVerifyInput {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

export const createPaymentOrder = async (paymentInput: IPaymentInput) => {
  const { amount, currency = "INR" } = paymentInput;
  try {
    const options = {
      amount: amount, // convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw error;
  }
};

// controllers/payment.controller.ts

export const verifyPayment = async (paymentInput: IPaymentVerifyInput,orderInput:Partial<IOrder>) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentInput;

  // ✅ Verify signature
  const sign = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (sign !== razorpay_signature) {
    throw new AppError("INVALID_PAYMENT", "Invalid payment signature", 400);
  }

  // ✅ Create order in DB
  const order = await Order.create({
    ...orderInput,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    paymentStatus: "paid",
  });

  return { success: true, order };
};
