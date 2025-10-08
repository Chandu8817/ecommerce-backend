import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../utils/AppError";
import * as wishlistService from "../services/wishlist.service";

export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const {productId} = req.body;
        const wishlist = await wishlistService.addToWishlist(userId,productId);
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
}

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const {productId} = req.params;
        const wishlist = await wishlistService.removeFromWishlist(userId,productId);
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
}

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const wishlist = await wishlistService.getWishlist(userId);
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
}

export const clearWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const userId = req.user.id;
        const wishlist = await wishlistService.clearWishlist(userId);
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
}

