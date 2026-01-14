"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String, sparse: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    shippingAddress: { type: [{
                name: String,
                street: String,
                city: String,
                state: String,
                zipCode: String,
                phone: String,
                isDefault: Boolean,
            }], default: [] },
}, { timestamps: true });
userSchema.methods.matchPassword = function (enterPassword) {
    return bcrypt_1.default.compare(enterPassword, this.password);
};
exports.User = (0, mongoose_1.model)("User", userSchema);
