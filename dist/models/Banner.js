"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const bannerSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String, trim: true },
    linkUrl: { type: String, trim: true },
    buttonText: { type: String, default: 'Shop Now', trim: true },
    offer: { type: String, trim: true },
    coupon: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
bannerSchema.index({ isActive: 1, createdAt: -1 });
bannerSchema.index({ createdBy: 1 });
exports.Banner = (0, mongoose_1.model)("Banner", bannerSchema);
