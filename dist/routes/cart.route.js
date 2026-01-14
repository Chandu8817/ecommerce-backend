"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_1.authMiddleware);
router.post("/", cart_controller_1.addToCart);
router.put("/", cart_controller_1.updateCartItem);
router.delete("/:productId", cart_controller_1.removeFromCart);
router.get("/", cart_controller_1.getCart);
router.delete("/", cart_controller_1.clearCart);
exports.default = router;
