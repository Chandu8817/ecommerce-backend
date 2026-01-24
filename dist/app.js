"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
const response_1 = require("./utils/response");
const dotenv_1 = __importDefault(require("dotenv"));
const v1Routes = __importStar(require("./routes/v1"));
const body_parser_1 = __importDefault(require("body-parser"));
const razorpayWebhook_1 = require("./services/razorpayWebhook");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://www.rawbharat.shop",
    "https://store-manager-rawbharat.netlify.app",
    "http://localhost:8080",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps, curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// razarpay webhook handler
app.post("/api/v1/webhooks/razorpay", body_parser_1.default.raw({ type: "*/*" }), razorpayWebhook_1.razorpayWebhook);
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// API Versioning: All routes under /api/v1
app.use("/api/v1/auth", v1Routes.authRoutes);
app.use("/api/v1/products", v1Routes.productRoutes);
app.use("/api/v1/order", v1Routes.orderRoutes);
app.use("/api/v1/banners", v1Routes.bannerRoutes);
app.use("/api/v1/wishlist", v1Routes.wishlistRoutes);
app.use("/api/v1/cart", v1Routes.cartRoutes);
app.use("/api/v1/reviews", v1Routes.reviewRoutes);
app.use("/api/v1/categories", v1Routes.categoryRoutes);
app.use("/api/v1/payment", v1Routes.paymentRoutes);
app.use("/api/v1/uploads", v1Routes.uploadRoutes);
app.use("/api/v1/images", v1Routes.getImageRoutes);
app.use("/api/v1/webhook", v1Routes.webhookRoutes);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json((0, response_1.success)({ status: "ok" }, "Service healthy"));
});
// Error handler - must be after all routes
app.use(errorHandler_1.errorHandler);
exports.default = app;
