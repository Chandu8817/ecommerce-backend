import express from "express"
import cors from "cors"
import morgan from "morgan"

import { errorHandler } from "./middlewares/errorHandler";

import dotenv from "dotenv"
import { authRoutes, productRoutes, orderRoutes, bannerRoutes, cartRoutes, categoryRoutes,
     paymentRoutes, reviewRoutes, wishlistRoutes, uploadRoutes } from "./routes";
import path from "path";


dotenv.config()


const app = express()


app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




export default app;