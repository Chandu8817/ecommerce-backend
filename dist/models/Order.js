"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const shippingAddressSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false } // important
);
const orderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{
            product: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", requried: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled", "return", "refunded"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded", "refund_failed"], default: "pending" },
    paymentId: { type: String, index: true },
    orderId: { type: String, index: true },
    refundId: { type: String, index: true },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    shippingProvider: { type: String, default: "shiprocket" },
    shippingOrderId: { type: String, index: true },
    awbCode: { type: String, index: true },
    courierName: { type: String },
    trackingUrl: { type: String },
    shipmentStatus: { type: String },
    paymentMethod: { type: String, required: true },
    shippingId: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
orderSchema.index({ user: 1, createdAt: -1 });
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
