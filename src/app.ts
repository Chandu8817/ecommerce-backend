import express from "express"
import cors from "cors"
import morgan from "morgan"
import { errorHandler } from "./middleware/errorHandler";

import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route"
import bannerRoutes from "./routes/banner.routes"

dotenv.config()


const app = express()


app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/banner", bannerRoutes);
app.use(errorHandler);



export default app;