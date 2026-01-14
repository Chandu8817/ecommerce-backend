import * as cartService from "../services/cart.service";
import { AuthRequest } from "../middlewares/auth";
import { Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";

export const addToCart = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const {productId,quantity} = req.body;
        const cart = await cartService.addToCart(userId, productId, quantity);
        res.json(cart);
    } catch (error) {
        next(error);
    }
}

export const updateCartItem =  async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const {productId,quantity} = req.body;
        const cart = await cartService.updateCartItem(userId,productId,quantity);
        res.json(cart);
    } catch (error) {
        next(error);
    }
}

export const removeFromCart = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const {productId} = req.params;
        const cart = await cartService.removeFromCart(userId,productId);
        res.json(cart);
    } catch (error) {
        next(error);
    }
}

export const getCart = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const cart = await cartService.getCart(userId);
        res.json(cart);
    } catch (error) {
        next(error);
    }
}

export const clearCart = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const cart = await cartService.clearCart(userId);
        res.json(cart);
    } catch (error) {
        next(error);
    }
}
