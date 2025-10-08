import * as orderService from "../services/order.service";
import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../utils/AppError";
import { create } from "domain";
import { Types } from "mongoose";

export const createOrder = async (req: AuthRequest, res: Response,next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;
    const { products, totalAmount, status, shippingAddress, paymentMethod } =
      req.body;

    const order = await orderService.createOrder({
      user: new Types.ObjectId(userId),
      products,
      totalAmount,
      status,
      shippingAddress,
      paymentMethod,
    });
    res.status(201).json(order);
  } catch (err: any) {
    next(err);
  }
};
export const getOrderById = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    res.json(order);
  } catch (err: any) {
    next(err);
  }
};
export const getOrders = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const take = parseInt(req.query.take as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;
    const orders = await orderService.getOrders(take, skip, req.user.id);
    res.json(orders);
  } catch (err: any) {
    next(err);
  }
};
export const getOrdersByUser = async (req: AuthRequest, res: Response, next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;
    const take = parseInt(req.query.take as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;
    const orders = await orderService.getOrdersByUser(userId, take, skip);
    res.json(orders);
  } catch (err: any) {
    next(err);
  }
};
export const cancelOrder = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;
    const { id } = req.params;
    const order = await orderService.cancelOrder(id, userId);
    res.json(order);
  } catch (err: any) {
   next(err);
  }
};
export const getOrdersByStatus = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { status } = req.params;
    const take = parseInt(req.query.take as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;
    const orders = await orderService.getOrdersByStatus(
      status as any,
      take,
      skip
    );
    res.json(orders);
  } catch (err: any) {
next(err);
  }
};
export const updateOrderStatus = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);
    res.json(order);
  } catch (err: any) {
    next(err);
  }
};
export const getTotalSales = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const totalSales = await orderService.getTotalSales();
    res.json({ totalSales });
  } catch (err: any) {
    next(err);
  }
};

export const getMonthlySalesReport = async (
  req: AuthRequest,
  res: Response,next:NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const report = await orderService.getMonthlySales(year);
    res.json(report);
  } catch (err: any) {
    next(err);
  }
};
export const getSalesByProducts = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
     const take = parseInt(req.query.take as string) || 10;
    const skip = parseInt(req.query.skip as string) || 0;

    const sales = await orderService.getSalesByProduct(take, skip);
    res.json({ id, sales });
  } catch (err: any) {
    next(err);
  }
};
export const filterOrders = async (req: AuthRequest, res: Response,next:NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const filter = req.body;
    const orders = await orderService.filterOrders(filter);
    res.json(orders);
  } catch (err: any) {
 next(err);
  }
};
