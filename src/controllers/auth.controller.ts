
import * as authService from "../services/auth.service";

import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

dotenv.config()

const generateToken = (id: Object) => {
    return jwt.sign({ id }, process.env.JWT_SECRECT || "secret", { expiresIn: "7d" })
}

export const register = async (req: Request, res: Response ,next:NextFunction) => {
    try {
        const { name, email, password,role } = req.body;

        const user = await authService.register({ name, email, password,role });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (err: any) {
      next(err)
    }

}

export const login = async (req: Request, res: Response ,next:NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await authService.login({ email, password });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (err: any) {
      next(err)
    }

}


export const getAuthUser = async (req: AuthRequest, res: Response,next:NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const user = await authService.getAuthUser(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (e: any) {
      next(e)
    }
};
