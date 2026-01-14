"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
router.post("/create", auth_1.authMiddleware, payment_controller_1.createPaymentOrder);
router.post("/verify", (req, _res, next) => {
    console.log("➡️ /payment/verify ROUTE HIT");
    next();
}, auth_1.authMiddleware, payment_controller_1.verifyPayment);
exports.default = router;
