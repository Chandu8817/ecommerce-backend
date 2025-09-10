import * as bannerService from "../services/banner.service";
import { Response, Request } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";
export const createBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const { title, imageUrl, linkUrl, isActive } = req.body;
        if (!title || !imageUrl || !linkUrl) {
            return res
                .status(400)
                .json({ error: "Title , ImageUrl and LinkUrl are required" });
        }


        const banner = await bannerService.createBanner({
            title,
            imageUrl,
            linkUrl,
            isActive,
        }, new Types.ObjectId(userId));
        res.status(201).json(banner);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_CREATION_FAILED",
            err.message || "Banner creation failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
};
export const getBanners = async (req: Request, res: Response) => {
    try {
        const take = parseInt(req.query.take as string) || 10;
        const skip = parseInt(req.query.skip as string) || 0;
        const banners = await bannerService.getBanners(take, skip);
        res.json(banners);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNERS_FETCH_FAILED",
            err.message || "Banners fetch failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
};
export const getActiveBanners = async (req: Request, res: Response) => {
    try {
        const take = parseInt(req.query.take as string) || 10;
        const skip = parseInt(req.query.skip as string) || 0;
        const banners = await bannerService.getActiveBanners(take, skip);
        res.json(banners);
    } catch (err: any) {
        const errorResponse = new AppError(
            "ACTIVE_BANNERS_FETCH_FAILED",
            err.message || "Active banners fetch failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
}
export const getBannerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const banner = await bannerService.getBannerById(id);
        res.json(banner);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_FETCH_FAILED",
            err.message || "Banner fetch failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
};
export const updateBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const { title, imageUrl, linkUrl, isActive } = req.body;
        const updateData: any = {};
        if (title) updateData.title = title;
        if (imageUrl) updateData.imageUrl = imageUrl;
        if (linkUrl) updateData.linkUrl = linkUrl;
        if (isActive !== undefined) updateData.isActive = isActive;

        const banner = await bannerService.updateBanner(id, updateData);
        res.json(banner);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_UPDATE_FAILED",
            err.message || "Banner update failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
};
export const deleteBanner = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const banner = await bannerService.deleteBanner(id);
        res.json(banner);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_DELETION_FAILED",
            err.message || "Banner deletion failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
};
export const toggleBannerStatus = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const { id } = req.params;
        const { isActive } = req.body;
        if (isActive === undefined) {
            return res.status(400).json({ error: "isActive is required" });
        }
        const banner = await bannerService.toggleBannerStatus(id, isActive);
        res.json(banner);
    } catch (err: any) {
        const errorResponse = new AppError(
            "BANNER_STATUS_TOGGLE_FAILED",
            err.message || "Banner status toggle failed",
            500,
            []
        );
        res.status(500).json(errorResponse);
    }
}