"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const paymentService = __importStar(require("../services/payment.service"));
const cart_service_1 = require("../services/cart.service");
const createPaymentOrder = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        const order = await paymentService.createPaymentOrder({
            amount
        });
        res.json(order);
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentOrder = createPaymentOrder;
// controllers/payment.controller.ts
const verifyPayment = async (req, res, next) => {
    console.log("🔔 VERIFY PAYMENT API HIT"); // ✅ MUST PRINT
    try {
        console.log("📦 VERIFY BODY:", req.body);
        console.log("👤 VERIFY USER:", req.user);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
        if (!req.user) {
            console.log("❌ NO USER IN REQUEST");
            return res.status(401).json({ error: "Unauthorized" });
        }
        const order = await paymentService.verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }, {
            ...orderData,
            user: req.user.id,
            paymentStatus: "paid",
            paymentMethod: "razorpay"
        });
        if (order.success) {
            try {
                await (0, cart_service_1.clearCart)(req.user.id);
            }
            catch (err) {
                console.error("❌ ERROR DELETING CART ITEMS:", err);
            }
        }
        console.log("✅ ORDER CREATED:", order);
        res.json(order);
    }
    catch (error) {
        console.error("🔥 VERIFY CONTROLLER ERROR:", error);
        next(error);
    }
};
exports.verifyPayment = verifyPayment;
