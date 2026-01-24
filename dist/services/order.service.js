"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.filterOrders = exports.getSalesByProduct = exports.getMonthlySales = exports.getTotalSales = exports.getOrdersByStatus = exports.cancelOrder = exports.getOrdersByUser = exports.getOrders = exports.getOrderById = exports.createOrder = void 0;
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const AppError_1 = require("../utils/AppError");
const razorpay_1 = require("../utils/razorpay");
const SHIPPING_STATES = [
    "Madhya Pradesh",
    "Uttar Pradesh",
    "Bihar",
    "Jharkhand",
    "Odisha",
    "West Bengal",
    "Sikkim",
    "Assam",
    "Arunachal Pradesh",
    "Nagaland",
    "Manipur",
    "Mizoram",
    "Tripura",
    "Meghalaya",
    "Chhattisgarh",
];
const createOrder = async (orderInput) => {
    const { user, products, totalAmount, shippingAddress, paymentMethod } = orderInput;
    /// 
    if (!user ||
        !products ||
        products.length === 0 ||
        totalAmount == null ||
        !shippingAddress ||
        !paymentMethod) {
        throw new AppError_1.AppError("INVALID_INPUT", "Missing required fields", 400);
    }
    if (totalAmount < 0) {
        throw new AppError_1.AppError("INVALID_AMOUNT", "Total amount must be non-negative", 400);
    }
    if (!isValidShippingAddress(shippingAddress)) {
        throw new AppError_1.AppError("INVALID_SHIPPING", "Shipping address must be in allowed states", 400);
    }
    const order = await Order_1.Order.create(orderInput);
    // ✅ Update product stock safely
    for (const item of products) {
        const product = await Product_1.Product.findById(item.product);
        if (!product) {
            throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Product not found", 404);
        }
        if (product.stock < item.quantity) {
            throw new AppError_1.AppError("OUT_OF_STOCK", "Insufficient stock", 400);
        }
        product.stock -= item.quantity;
        await product.save();
    }
    return order;
};
exports.createOrder = createOrder;
const getOrderById = async (id) => {
    const order = await Order_1.Order.findById(id)
        .populate("user")
        .populate("products.product");
    if (!order) {
        // throw new Error("Order not found");
        throw new AppError_1.AppError("RESOURCE_NOT_FOUND", "Order not found", 404, [
            { field: "orderId", issue: "Does not exist in database" },
        ]);
    }
    return order;
};
exports.getOrderById = getOrderById;
const getOrders = async (take = 10, skip = 0, userId) => {
    const isAdmin = await isAdminUser(userId);
    if (isAdmin) {
        const orders = await Order_1.Order.find()
            .populate("user")
            .populate("products.product")
            .limit(take)
            .skip(skip)
            .sort({ createdAt: -1 });
        return orders;
    }
    else {
        throw new Error("Unauthorized");
    }
};
exports.getOrders = getOrders;
const getOrdersByUser = async (userId, take = 10, skip = 0) => {
    const orders = await Order_1.Order.find({ user: userId })
        .populate("products.product")
        .limit(take)
        .skip(skip)
        .sort({ createdAt: -1 });
    return orders;
};
exports.getOrdersByUser = getOrdersByUser;
const cancelOrder = async (id, userId) => {
    const order = await Order_1.Order.findById(id);
    if (!order) {
        throw new Error("Order not found");
    }
    if (order.user.toString() !== userId) {
        throw new AppError_1.AppError("FORBIDDEN", "You can only cancel your own orders", 403, [{ field: "userId", issue: "Forbidden" }]);
    }
    if (["shipped", "delivered"].includes(order.status)) {
        throw new Error("Cannot cancel shipped or delivered order");
    }
    // 🔁 Refund logic
    if (order.status === "pending" &&
        order.paymentStatus === "paid" &&
        order.paymentMethod === "razorpay" &&
        order.paymentId) {
        try {
            const refund = await razorpay_1.razorpay.payments.refund(order.paymentId, {
                amount: order.totalAmount * 100, // ₹ → paise
                speed: "optimum",
                notes: {
                    reason: "Order cancelled by user",
                    orderId: id.toString(),
                },
            });
            order.paymentStatus = "refunded";
            order.refundId = refund.id; // add this field in schema
        }
        catch (error) {
            console.error("Razorpay refund error:", error);
            throw new Error("Refund failed. Please try again later.");
        }
    }
    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();
    return order;
};
exports.cancelOrder = cancelOrder;
const getOrdersByStatus = async (status, take = 10, skip = 0) => {
    const orders = await Order_1.Order.find({ status })
        .populate("user")
        .populate("products.product")
        .limit(take)
        .skip(skip)
        .sort({ createdAt: -1 });
    return orders;
};
exports.getOrdersByStatus = getOrdersByStatus;
const getTotalSales = async () => {
    const result = await Order_1.Order.aggregate([
        {
            $match: {
                status: { $in: ["delivered"] },
            },
        },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);
    return result[0]?.totalSales || 0;
};
exports.getTotalSales = getTotalSales;
const getMonthlySales = async (year) => {
    const result = await Order_1.Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${year + 1}-01-01`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalSales: { $sum: "$totalAmount" },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    const monthlySales = Array(12).fill(0);
    result.forEach((item) => {
        monthlySales[item._id - 1] = item.totalSales;
    });
    return monthlySales;
};
exports.getMonthlySales = getMonthlySales;
const getSalesByProduct = async (take = 10, skip = 0) => {
    const result = await Order_1.Order.aggregate([
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product",
                totalSales: {
                    $sum: { $multiply: ["$products.quantity", "$totalAmount"] },
                },
                totalQuantity: { $sum: "$products.quantity" },
            },
        },
        { $sort: { totalSales: -1 } },
        { $skip: skip },
        { $limit: take },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: 0,
                productId: "$product._id",
                productName: "$product.name",
                totalSales: 1,
                totalQuantity: 1,
            },
        },
    ]);
    return result;
};
exports.getSalesByProduct = getSalesByProduct;
const filterOrders = async (filter) => {
    const { user, status, shippingAddress, paymentMethod, createdAt, take = 10, skip = 0, } = filter;
    const query = {};
    if (user)
        query.user = user;
    if (status)
        query.status = status;
    if (shippingAddress)
        query.shippingAddress = { $regex: shippingAddress, $options: "i" };
    if (paymentMethod)
        query.paymentMethod = {
            $regex: paymentMethod,
            $options: "i",
        };
    if (createdAt) {
        const date = new Date(createdAt);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        query.createdAt = { $gte: date, $lt: nextDate };
    }
    const orders = await Order_1.Order.find(query)
        .populate("user")
        .populate("products.product")
        .limit(take)
        .skip(skip)
        .sort({ createdAt: -1 });
    const total = await Order_1.Order.countDocuments(query);
    return [orders, total];
};
exports.filterOrders = filterOrders;
const updateOrderStatus = async (id, status) => {
    const order = await Order_1.Order.findById(id);
    if (!order) {
        throw new Error("Order not found");
    }
    order.status = status;
    order.updatedAt = new Date();
    await order.save();
    return order;
};
exports.updateOrderStatus = updateOrderStatus;
const isValidShippingAddress = (address) => {
    if (!address || !address.state)
        return false;
    return SHIPPING_STATES.includes(address.state);
};
const isAdminUser = async (userId) => {
    //check user role admin
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === "admin") {
        return true;
    }
    return false;
};
