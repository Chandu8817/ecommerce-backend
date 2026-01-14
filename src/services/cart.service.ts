import { Types } from "mongoose";
import { Cart } from "../models/Cart";
import { AppError } from "../utils/AppError";

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  const userIdObj = new Types.ObjectId(userId);
  const productIdObj = new Types.ObjectId(productId);

  // Check if item already exists in cart
  let cart = await Cart.findOne({ 
    userId: userIdObj,
    'items.productId': productIdObj
  });

  if (cart) {
    // Update quantity if item exists
    cart = await Cart.findOneAndUpdate(
      { 
        userId: userIdObj,
        'items.productId': productIdObj
      },
      { 
        $inc: { 'items.$.quantity': quantity },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).populate('items.productId');
  } else {
    // Add new item or create cart if doesn't exist
    cart = await Cart.findOneAndUpdate(
      { userId: userIdObj },
      { 
        $push: { items: { productId: productIdObj, quantity } },
        $set: { updatedAt: new Date() }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).populate('items.productId');
  }

  return cart;
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
  if (quantity <= 0) {
    return removeFromCart(userId, productId);
  }

  const cart = await Cart.findOneAndUpdate(
    { 
      userId: new Types.ObjectId(userId),
      'items.productId': new Types.ObjectId(productId)
    },
    { 
      $set: { 
        'items.$.quantity': quantity,
        updatedAt: new Date()
      } 
    },
    { new: true }
  ).populate('items.productId');

  if (!cart) {
    throw new AppError("CART_ITEM_NOT_FOUND", "Product not found in cart", 404);
  }

  return cart;
};

export const removeFromCart = async (userId: string, productId: string) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { 
      $pull: { 
        items: { productId: new Types.ObjectId(productId) } 
      },
      $set: { updatedAt: new Date() }
    },
    { new: true }
  ).populate('items.productId');

  if (!cart) {
    return { items: [] };
  }

  return cart;
};

export const getCart = async (userId: string) => {
  console.log('Getting cart for user:', userId);
  const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) })
    .populate('items.productId');
  
  console.log('Retrieved cart:', cart);
    
  if (!cart) {
    return { items: [] };
  }
  
  return cart;
};

export const clearCart = async (userId: string) => {
  const cart = await Cart.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { 
      $set: { 
        items: [],
        updatedAt: new Date()
      } 
    },
    { new: true }
  ).populate('items.productId');
  
  return cart || { items: [] };
};
