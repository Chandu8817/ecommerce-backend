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
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterOrders = exports.getSalesByProducts = exports.getMonthlySalesReport = exports.getTotalSales = exports.updateOrderStatus = exports.getOrdersByStatus = exports.cancelOrder = exports.getOrdersByUser = exports.getOrders = exports.getOrderById = exports.createOrder = void 0;
const orderService = __importStar(require("../services/order.service"));
const mongoose_1 = require("mongoose");
const createOrder = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const { products, totalAmount, status, shippingAddress, paymentMethod } = req.body;
        const order = await orderService.createOrder({
            user: new mongoose_1.Types.ObjectId(userId),
            products,
            totalAmount,
            status,
            shippingAddress,
            paymentMethod,
        });
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
};
exports.createOrder = createOrder;
const getOrderById = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const order = await orderService.getOrderById(id);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
const getOrders = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const take = parseInt(req.query.take) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const orders = await orderService.getOrders(take, skip, req.user.id);
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
};
exports.getOrders = getOrders;
const getOrdersByUser = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const take = parseInt(req.query.take) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const orders = await orderService.getOrdersByUser(userId, take, skip);
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
};
exports.getOrdersByUser = getOrdersByUser;
const cancelOrder = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const { id } = req.params;
        const order = await orderService.cancelOrder(id, userId);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
};
exports.cancelOrder = cancelOrder;
const getOrdersByStatus = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { status } = req.params;
        const take = parseInt(req.query.take) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const orders = await orderService.getOrdersByStatus(status, take, skip);
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
};
exports.getOrdersByStatus = getOrdersByStatus;
const updateOrderStatus = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(id, status);
        res.json(order);
    }
    catch (err) {
        next(err);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getTotalSales = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const totalSales = await orderService.getTotalSales();
        res.json({ totalSales });
    }
    catch (err) {
        next(err);
    }
};
exports.getTotalSales = getTotalSales;
const getMonthlySalesReport = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const report = await orderService.getMonthlySales(year);
        res.json(report);
    }
    catch (err) {
        next(err);
    }
};
exports.getMonthlySalesReport = getMonthlySalesReport;
const getSalesByProducts = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const take = parseInt(req.query.take) || 10;
        const skip = parseInt(req.query.skip) || 0;
        const sales = await orderService.getSalesByProduct(take, skip);
        res.json({ id, sales });
    }
    catch (err) {
        next(err);
    }
};
exports.getSalesByProducts = getSalesByProducts;
const filterOrders = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const filter = req.body;
        const orders = await orderService.filterOrders(filter);
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
};
exports.filterOrders = filterOrders;
