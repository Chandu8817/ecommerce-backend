"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Order_1 = require("../models/Order");
const razorpayWebhook = async (req, res) => {
    console.log("🔥 Razorpay webhook HIT");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;
    const expectedSignature = crypto_1.default
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");
    if (signature !== expectedSignature) {
        return res.status(400).send("Invalid signature");
    }
    const event = JSON.parse(body.toString());
    console.log("🔥 Razorpay webhook hit");
    console.log("Event:", event.event);
    console.log("Payload:", event.payload.refund?.entity);
    // 🧠 Handle refund success
    if (event.event === "refund.processed") {
        const refund = event.payload.refund.entity;
        await Order_1.Order.findOneAndUpdate({ paymentId: refund.payment_id }, {
            paymentStatus: "refunded",
            refundId: refund.id,
            updatedAt: new Date(),
        });
    }
    // ❌ Refund failed
    if (event.event === "refund.failed") {
        const refund = event.payload.refund.entity;
        await Order_1.Order.findOneAndUpdate({ paymentId: refund.payment_id }, {
            paymentStatus: "refund_failed",
            updatedAt: new Date(),
        });
    }
    res.status(200).json({ status: "ok" });
};
exports.razorpayWebhook = razorpayWebhook;
