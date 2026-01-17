import { AuthRequest } from "../middlewares/auth";
import * as categoryService from "../services/category.service";
import { Request, Response, NextFunction } from "express";


export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
           console.log("Creating category", req.body);
        const category = await categoryService.createCategory(req.body,req.user.id);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
}

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}

export const getCategoryByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await categoryService.getCategoryByName(req.params.name);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const category = await categoryService.updateCategory(req.params.id, req.body,req.user.id);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});
        const category = await categoryService.deleteCategory(req.params.id,req.user.id);
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
}

