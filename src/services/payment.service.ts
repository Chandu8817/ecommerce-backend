// controllers/payment.controller.ts
import crypto from "crypto";
import { IOrder, Order } from "../models/Order";
import { razorpay } from "../utils/razorpay";
import { AppError } from "../utils/AppError";
import { createShipment } from "./shiprocket.service";

interface IPaymentInput {
  amount: number;
  currency?: string;
}
interface IPaymentVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const createPaymentOrder = async ({ amount, currency = 'INR' }: IPaymentInput) => {
  const options = {
    amount, // already in paise
    currency,
    receipt: `receipt_${Date.now()}`
  }

  return await razorpay.orders.create(options)
}


// controllers/payment.controller.ts

export const verifyPayment = async (
  paymentInput: IPaymentVerifyInput,
  orderInput: Partial<IOrder>
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = paymentInput;

    if (!process.env.RAZORPAY_SECRET) {
      throw new AppError(
        "CONFIG_ERROR",
        "Razorpay secret is not configured",
        500
      );
    }

    // ✅ Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new AppError(
        "INVALID_PAYMENT",
        "Invalid payment signature",
        400
      );
    }

    // ✅ Create order in DB
    const order = await Order.create({
      ...orderInput,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: "paid"
    });
    // const shipment = await createShipment(order);

    // order.shippingOrderId = shipment.order_id;
    // order.awbCode = shipment.awb_code;
    // order.courierName = shipment.courier_name;
    // order.trackingUrl = shipment.tracking_url;
    // order.shipmentStatus = shipment.status;

    await order.save();

    return { success: true, order };
  } catch (error: any) {
    console.error("❌ VERIFY PAYMENT SERVICE ERROR:", error);

    // Preserve AppError (important)
    if (error instanceof AppError) {
      throw error;
    }

    // Convert unknown errors to AppError
    throw new AppError(
      "PAYMENT_VERIFY_FAILED",
      error.message || "Payment verification failed",
      500
    );
  }
};
