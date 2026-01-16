import express from "express"
import cors from "cors"
import morgan from "morgan"

import { errorHandler } from "./middlewares/errorHandler";
import { success } from "./utils/response";

import dotenv from "dotenv"
import * as v1Routes from "./routes/v1";


dotenv.config()

const app = express()

// Middleware

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://www.rawbharat.shop",
  "https://graceful-dolphin-9330e7.netlify.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
     res.json(success({ status: "ok" }, "Service healthy"));
});

// Error handler - must be after all routes
app.use(errorHandler);





export default app;