"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.getCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = void 0;
const mongoose_1 = require("mongoose");
const Cart_1 = require("../models/Cart");
const AppError_1 = require("../utils/AppError");
const addToCart = async (userId, productId, quantity = 1) => {
    const userIdObj = new mongoose_1.Types.ObjectId(userId);
    const productIdObj = new mongoose_1.Types.ObjectId(productId);
    // Check if item already exists in cart
    let cart = await Cart_1.Cart.findOne({
        userId: userIdObj,
        'items.productId': productIdObj
    });
    if (cart) {
        // Update quantity if item exists
        cart = await Cart_1.Cart.findOneAndUpdate({
            userId: userIdObj,
            'items.productId': productIdObj
        }, {
            $inc: { 'items.$.quantity': quantity },
            $set: { updatedAt: new Date() }
        }, { new: true }).populate('items.productId');
    }
    else {
        // Add new item or create cart if doesn't exist
        cart = await Cart_1.Cart.findOneAndUpdate({ userId: userIdObj }, {
            $push: { items: { productId: productIdObj, quantity } },
            $set: { updatedAt: new Date() }
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }).populate('items.productId');
    }
    return cart;
};
exports.addToCart = addToCart;
const updateCartItem = async (userId, productId, quantity) => {
    if (quantity <= 0) {
        return (0, exports.removeFromCart)(userId, productId);
    }
    const cart = await Cart_1.Cart.findOneAndUpdate({
        userId: new mongoose_1.Types.ObjectId(userId),
        'items.productId': new mongoose_1.Types.ObjectId(productId)
    }, {
        $set: {
            'items.$.quantity': quantity,
            updatedAt: new Date()
        }
    }, { new: true }).populate('items.productId');
    if (!cart) {
        throw new AppError_1.AppError("CART_ITEM_NOT_FOUND", "Product not found in cart", 404);
    }
    return cart;
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (userId, productId) => {
    const cart = await Cart_1.Cart.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, {
        $pull: {
            items: { productId: new mongoose_1.Types.ObjectId(productId) }
        },
        $set: { updatedAt: new Date() }
    }, { new: true }).populate('items.productId');
    if (!cart) {
        return { items: [] };
    }
    return cart;
};
exports.removeFromCart = removeFromCart;
const getCart = async (userId) => {
    console.log('Getting cart for user:', userId);
    const cart = await Cart_1.Cart.findOne({ userId: new mongoose_1.Types.ObjectId(userId) })
        .populate('items.productId');
    console.log('Retrieved cart:', cart);
    if (!cart) {
        return { items: [] };
    }
    return cart;
};
exports.getCart = getCart;
const clearCart = async (userId) => {
    const cart = await Cart_1.Cart.findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, {
        $set: {
            items: [],
            updatedAt: new Date()
        }
    }, { new: true }).populate('items.productId');
    return cart || { items: [] };
};
exports.clearCart = clearCart;
