"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBannerStatus = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getActiveBanners = exports.getBanners = exports.createBanner = void 0;
const Banner_1 = require("../models/Banner");
const User_1 = require("../models/User");
const checkAdminPermission = async (userId) => {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "admin") {
        throw new Error("User does not have admin role");
    }
};
const createBanner = async (bannerInput, userId) => {
    await checkAdminPermission(userId);
    const bannerData = {
        ...bannerInput,
        createdBy: userId,
        updatedBy: userId
    };
    const banner = await Banner_1.Banner.create(bannerData);
    return banner;
};
exports.createBanner = createBanner;
const getBanners = async (options = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = {};
    if (options.isActive !== undefined)
        query.isActive = options.isActive;
    if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
    }
    // Date range filtering
    const now = new Date();
    const dateQuery = {};
    if (options.startDate)
        dateQuery.$gte = options.startDate;
    if (options.endDate)
        dateQuery.$lte = options.endDate;
    if (Object.keys(dateQuery).length > 0) {
        query.$or = [
            { startDate: { $exists: false }, endDate: { $exists: false } },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: { $exists: false } },
            { startDate: { $exists: false }, endDate: { $gte: now } }
        ];
    }
    const [banners, total] = await Promise.all([
        Banner_1.Banner.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email'),
        Banner_1.Banner.countDocuments(query)
    ]);
    return { banners, total };
};
exports.getBanners = getBanners;
const getActiveBanners = async () => {
    const now = new Date();
    const query = {
        isActive: true,
        $or: [
            { startDate: { $exists: false }, endDate: { $exists: false } },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: { $exists: false } },
            { startDate: { $exists: false }, endDate: { $gte: now } }
        ]
    };
    return Banner_1.Banner.find(query)
        .sort({ createdAt: -1 })
        .limit(10);
};
exports.getActiveBanners = getActiveBanners;
const getBannerById = async (bannerId) => {
    const banner = await Banner_1.Banner.findById(bannerId)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};
exports.getBannerById = getBannerById;
const updateBanner = async (bannerId, updateData, userId) => {
    await checkAdminPermission(userId);
    const banner = await Banner_1.Banner.findByIdAndUpdate(bannerId, {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
    }, { new: true });
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};
exports.updateBanner = updateBanner;
const deleteBanner = async (bannerId, userId) => {
    await checkAdminPermission(userId);
    const banner = await Banner_1.Banner.findByIdAndDelete(bannerId);
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};
exports.deleteBanner = deleteBanner;
const toggleBannerStatus = async (bannerId, isActive, userId) => {
    await checkAdminPermission(userId);
    const banner = await Banner_1.Banner.findByIdAndUpdate(bannerId, {
        isActive,
        updatedBy: userId,
        updatedAt: new Date()
    }, { new: true });
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};
exports.toggleBannerStatus = toggleBannerStatus;
