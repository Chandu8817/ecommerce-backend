"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
// security.ts
// Security middleware setup (helmet, CORS)
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("../config/env");
exports.securityMiddleware = [
    (0, helmet_1.default)(),
    (0, cors_1.default)({
        origin: env_1.NODE_ENV === "production" ? ["https://yourdomain.com"] : true,
        credentials: true,
    }),
];
