"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// OTP-based authentication (new flow)
router.post("/request-otp", auth_controller_1.requestOTP);
router.post("/verify-otp", auth_controller_1.verifyOTP);
// User profile
router.post("/update-profile", auth_1.authMiddleware, auth_controller_1.updateProfile);
router.get("/me", auth_1.authMiddleware, auth_controller_1.getAuthUser);
router.post("/shipping-address", auth_1.authMiddleware, auth_controller_1.addShippingAddress);
router.delete("/shipping-address/:id", auth_1.authMiddleware, auth_controller_1.removeShippingAddress);
router.get("/shipping-address", auth_1.authMiddleware, auth_controller_1.getShippingAddress);
exports.default = router;
