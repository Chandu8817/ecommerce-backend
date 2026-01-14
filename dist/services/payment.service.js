"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
// controllers/payment.controller.ts
const crypto_1 = __importDefault(require("crypto"));
const Order_1 = require("../models/Order");
const razorpay_1 = require("../utils/razorpay");
const AppError_1 = require("../utils/AppError");
const createPaymentOrder = async ({ amount, currency = 'INR' }) => {
    const options = {
        amount, // already in paise
        currency,
        receipt: `receipt_${Date.now()}`
    };
    return await razorpay_1.razorpay.orders.create(options);
};
exports.createPaymentOrder = createPaymentOrder;
// controllers/payment.controller.ts
const verifyPayment = async (paymentInput, orderInput) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentInput;
        if (!process.env.RAZORPAY_SECRET) {
            throw new AppError_1.AppError("CONFIG_ERROR", "Razorpay secret is not configured", 500);
        }
        // ✅ Verify Razorpay signature
        const generatedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (generatedSignature !== razorpay_signature) {
            throw new AppError_1.AppError("INVALID_PAYMENT", "Invalid payment signature", 400);
        }
        // ✅ Create order in DB
        const order = await Order_1.Order.create({
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
    }
    catch (error) {
        console.error("❌ VERIFY PAYMENT SERVICE ERROR:", error);
        // Preserve AppError (important)
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        // Convert unknown errors to AppError
        throw new AppError_1.AppError("PAYMENT_VERIFY_FAILED", error.message || "Payment verification failed", 500);
    }
};
exports.verifyPayment = verifyPayment;
