"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishList = void 0;
const mongoose_1 = require("mongoose");
const wishListSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    products: [{ type: mongoose_1.Types.ObjectId, ref: "Product", required: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
wishListSchema.index({ userId: 1, createdAt: -1 });
exports.WishList = (0, mongoose_1.model)("WishList", wishListSchema);
