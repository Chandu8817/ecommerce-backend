import { Router } from "express";
import { getOrderById, getOrders, createOrder,
    filterOrders,getMonthlySalesReport, getSalesByProducts, getTotalSales,
    updateOrderStatus,cancelOrder,getOrdersByUser,getOrdersByStatus
 } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth";


const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/sales", authMiddleware, getSalesByProducts);
router.get("/total-sales", authMiddleware, getTotalSales);
router.get("/monthly-sales", authMiddleware, getMonthlySalesReport);
router.post("/filter", authMiddleware, filterOrders);
router.get("/:id", authMiddleware, getOrderById);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.patch("/:id/cancel", authMiddleware, cancelOrder);
router.get("/user/:userId", authMiddleware, getOrdersByUser);
router.get("/status/:status", authMiddleware, getOrdersByStatus);
export default router;


