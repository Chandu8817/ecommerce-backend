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
exports.toggleBannerStatus = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getActiveBanners = exports.getBanners = exports.createBanner = exports.validateBanner = void 0;
const bannerService = __importStar(require("../services/banner.service"));
const AppError_1 = require("../utils/AppError");
const mongoose_1 = require("mongoose");
const validationUtils_1 = require("../utils/validationUtils");
Object.defineProperty(exports, "validateBanner", { enumerable: true, get: function () { return validationUtils_1.validateRequest; } });
// Create a new banner
const createBanner = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError_1.AppError('UNAUTHORIZED', 'Authentication required', 401);
        }
        const userId = req.user.id;
        const { title, subtitle, description, imageUrl, mobileImageUrl, linkUrl, buttonText, startDate, endDate, isActive = true } = req.body;
        console.log(req.body);
        const banner = await bannerService.createBanner({
            title,
            subtitle,
            description,
            imageUrl,
            mobileImageUrl,
            linkUrl,
            buttonText,
            offer: req.body.offer,
            coupon: req.body.coupon,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            isActive
        }, new mongoose_1.Types.ObjectId(userId));
        res.status(201).json({
            success: true,
            data: banner
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNER_CREATION_FAILED", err.message || "Failed to create banner", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.createBanner = createBanner;
// Get banners with filtering and pagination
const getBanners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { type, position, isActive, tags, startDate, endDate } = req.query;
        const filterOptions = {};
        if (type)
            filterOptions.type = type;
        if (position)
            filterOptions.position = position;
        if (isActive !== undefined)
            filterOptions.isActive = isActive === 'true';
        if (tags) {
            filterOptions.tags = Array.isArray(tags) ? tags : [tags];
        }
        if (startDate)
            filterOptions.startDate = new Date(startDate);
        if (endDate)
            filterOptions.endDate = new Date(endDate);
        const { banners, total } = await bannerService.getBanners(filterOptions, page, limit);
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
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNERS_FETCH_FAILED", err.message || "Failed to fetch banners", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.getBanners = getBanners;
// Get active banners for public access
const getActiveBanners = async (req, res) => {
    try {
        const banners = await bannerService.getActiveBanners();
        res.json({
            success: true,
            data: banners
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("ACTIVE_BANNERS_FETCH_FAILED", err.message || "Failed to fetch active banners", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.getActiveBanners = getActiveBanners;
// Get banner by ID
const getBannerById = async (req, res) => {
    try {
        const banner = await bannerService.getBannerById(req.params.id);
        res.json({
            success: true,
            data: banner
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNER_FETCH_FAILED", err.message || "Failed to fetch banner", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.getBannerById = getBannerById;
// Update banner
const updateBanner = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const bannerId = req.params.id;
        const updateData = { ...req.body };
        // Convert date strings to Date objects if they exist
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate)
            updateData.endDate = new Date(updateData.endDate);
        const banner = await bannerService.updateBanner(bannerId, updateData, new mongoose_1.Types.ObjectId(userId));
        res.json({
            success: true,
            data: banner
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNER_UPDATE_FAILED", err.message || "Failed to update banner", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.updateBanner = updateBanner;
// Delete banner
const deleteBanner = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        await bannerService.deleteBanner(req.params.id, new mongoose_1.Types.ObjectId(userId));
        res.json({
            success: true,
            message: "Banner deleted successfully"
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNER_DELETE_FAILED", err.message || "Failed to delete banner", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.deleteBanner = deleteBanner;
// Toggle banner status
const toggleBannerStatus = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = req.user.id;
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            throw new AppError_1.AppError("INVALID_INPUT", "isActive must be a boolean value", 400, []);
        }
        const banner = await bannerService.toggleBannerStatus(req.params.id, isActive, new mongoose_1.Types.ObjectId(userId));
        res.json({
            success: true,
            data: banner
        });
    }
    catch (err) {
        const errorResponse = new AppError_1.AppError("BANNER_STATUS_UPDATE_FAILED", err.message || "Failed to update banner status", err.statusCode || 500, []);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
};
exports.toggleBannerStatus = toggleBannerStatus;
