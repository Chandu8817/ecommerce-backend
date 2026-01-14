"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_1 = require("../controllers/wishlist.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_1.authMiddleware);
router.post("/", wishlist_controller_1.addToWishlist);
router.delete("/:productId", wishlist_controller_1.removeFromWishlist);
router.get("/", wishlist_controller_1.getWishlist);
router.delete("/", wishlist_controller_1.clearWishlist);
exports.default = router;
