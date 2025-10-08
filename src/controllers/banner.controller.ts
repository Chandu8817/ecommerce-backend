import * as bannerService from "../services/banner.service";
import { Response, Request, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";
import { BannerType, BannerPosition } from "../models/Banner";
import { validationResult } from "express-validator";

// Validation middleware for banner creation/update
export const validateBanner = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array()
        });
    }
    next();
};

// Create a new banner
export const createBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        
        const userId = req.user.id;
        const {
            title,
            subtitle,
            description,
            imageUrl,
            mobileImageUrl,
            linkUrl,
            buttonText,
            type,
            position,
            startDate,
            endDate,
            priority,
            tags,
            isActive = true
        } = req.body;

        const banner = await bannerService.createBanner({
            title,
            subtitle,
            description,
            imageUrl,
            mobileImageUrl,
            linkUrl,
            buttonText,
            type: type || BannerType.HERO,
            position: position || BannerPosition.TOP,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            priority: priority || 0,
            tags: Array.isArray(tags) ? tags : [],
            isActive
        }, new Types.ObjectId(userId));

        res.status(201).json({
            success: true,
            data: banner
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_CREATION_FAILED",
            err.message || "Failed to create banner",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Get banners with filtering and pagination
export const getBanners = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const { 
            type, 
            position, 
            isActive, 
            tags, 
            startDate, 
            endDate 
        } = req.query;

        const filterOptions: any = {};
        
        if (type) filterOptions.type = type;
        if (position) filterOptions.position = position;
        if (isActive !== undefined) filterOptions.isActive = isActive === 'true';
        if (tags) {
            filterOptions.tags = Array.isArray(tags) ? tags : [tags];
        }
        if (startDate) filterOptions.startDate = new Date(startDate as string);
        if (endDate) filterOptions.endDate = new Date(endDate as string);

        const { banners, total } = await bannerService.getBanners(
            filterOptions,
            page,
            limit
        );

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: banners,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNERS_FETCH_FAILED",
            err.message || "Failed to fetch banners",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Get active banners for public access
export const getActiveBanners = async (req: Request, res: Response) => {
    try {
        const { type, position, tags } = req.query;
        
        // Convert tags to string array if it exists
        let tagsArray: string[] | undefined;
        if (tags) {
            tagsArray = Array.isArray(tags) 
                ? tags.map(tag => String(tag))
                : [String(tags)];
        }
        
        const banners = await bannerService.getActiveBanners(
            type as BannerType,
            position as BannerPosition,
            tagsArray
        );

        res.json({
            success: true,
            data: banners
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "ACTIVE_BANNERS_FETCH_FAILED",
            err.message || "Failed to fetch active banners",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Get banner by ID
export const getBannerById = async (req: Request, res: Response) => {
    try {
        const banner = await bannerService.getBannerById(req.params.id);
        res.json({
            success: true,
            data: banner
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_FETCH_FAILED",
            err.message || "Failed to fetch banner",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Update banner
export const updateBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        
        const userId = req.user.id;
        const bannerId = req.params.id;
        const updateData = { ...req.body };
        
        // Convert date strings to Date objects if they exist
        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
        
        const banner = await bannerService.updateBanner(
            bannerId, 
            updateData, 
            new Types.ObjectId(userId)
        );
        
        res.json({
            success: true,
            data: banner
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_UPDATE_FAILED",
            err.message || "Failed to update banner",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Delete banner
export const deleteBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        
        const userId = req.user.id;
        await bannerService.deleteBanner(req.params.id, new Types.ObjectId(userId));
        
        res.json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_DELETE_FAILED",
            err.message || "Failed to delete banner",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};

// Toggle banner status
export const toggleBannerStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        
        const userId = req.user.id;
        const { isActive } = req.body;
        
        if (typeof isActive !== 'boolean') {
            throw new AppError(
                "INVALID_INPUT",
                "isActive must be a boolean value",
                400,
                []
            );
        }
        
        const banner = await bannerService.toggleBannerStatus(
            req.params.id, 
            isActive, 
            new Types.ObjectId(userId)
        );
        
        res.json({
            success: true,
            data: banner
        });
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_STATUS_UPDATE_FAILED",
            err.message || "Failed to update banner status",
            err.statusCode || 500,
            []
        );
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};