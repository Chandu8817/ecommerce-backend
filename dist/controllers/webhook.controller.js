"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiprocketWebhook = void 0;
const Order_1 = require("../models/Order");
const shiprocketWebhook = async (req, res) => {
    try {
        console.log("📦 SHIPROCKET WEBHOOK RECEIVED");
        console.log("BODY:", req.body);
        const { awb, current_status } = req.body;
        if (!awb) {
            return res.status(200).json({ message: "No AWB provided" });
        }
        const order = await Order_1.Order.findOne({ awbCode: awb });
        if (!order) {
            console.log("⚠️ Order not found for AWB:", awb);
            return res.sendStatus(200);
        }
        const statusMap = {
            "In Transit": "shipped",
            "Out For Delivery": "shipped",
            "Delivered": "delivered",
            "RTO Initiated": "return",
            "RTO Delivered": "return",
        };
        order.shipmentStatus = current_status;
        const mappedStatus = statusMap[current_status];
        if (mappedStatus) {
            order.status = mappedStatus;
        }
        await order.save();
        console.log("✅ Order updated from webhook:", order._id);
        res.sendStatus(200);
    }
    catch (error) {
        console.error("❌ Shiprocket webhook error:", error);
        // Shiprocket expects 200 even on error
        res.sendStatus(200);
    }
};
exports.shiprocketWebhook = shiprocketWebhook;
