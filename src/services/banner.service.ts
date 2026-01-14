import { Types } from "mongoose";
import { Banner, IBanner } from "../models/Banner";
import { User } from "../models/User";

interface BannerFilterOptions {
    tags?: string[];
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
}

const checkAdminPermission = async (userId: Types.ObjectId): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "admin") {
        throw new Error("User does not have admin role");
    }
};

export const createBanner = async (bannerInput: Partial<IBanner>, userId: Types.ObjectId): Promise<IBanner> => {
    await checkAdminPermission(userId);
    
    const bannerData = {
        ...bannerInput,
        createdBy: userId,
        updatedBy: userId
    };

    const banner = await Banner.create(bannerData);
    return banner;
};

export const getBanners = async (
    options: BannerFilterOptions = {},
    page: number = 1,
    limit: number = 10
): Promise<{ banners: IBanner[]; total: number }> => {
    const skip = (page - 1) * limit;
    
    const query: any = {};

    if (options.isActive !== undefined) query.isActive = options.isActive;
    if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
    }
    
    // Date range filtering
    const now = new Date();
    const dateQuery: any = {};
    
    if (options.startDate) dateQuery.$gte = options.startDate;
    if (options.endDate) dateQuery.$lte = options.endDate;
    
    if (Object.keys(dateQuery).length > 0) {
        query.$or = [
            { startDate: { $exists: false }, endDate: { $exists: false } },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: { $exists: false } },
            { startDate: { $exists: false }, endDate: { $gte: now } }
        ];
    }
    
    const [banners, total] = await Promise.all([
        Banner.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email'),
        Banner.countDocuments(query)
    ]);
    
    return { banners, total };
};

export const getActiveBanners = async (
): Promise<IBanner[]> => {
    const now = new Date();
    
    const query: any = {
        isActive: true,
        $or: [
            { startDate: { $exists: false }, endDate: { $exists: false } },
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $lte: now }, endDate: { $exists: false } },
            { startDate: { $exists: false }, endDate: { $gte: now } }
        ]
    };
    
   

    return Banner.find(query)
        .sort({createdAt: -1 })
        .limit(10);
};

export const getBannerById = async (bannerId: string): Promise<IBanner> => {
    const banner = await Banner.findById(bannerId)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
        
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};

export const updateBanner = async (
    bannerId: string, 
    updateData: Partial<IBanner>,
    userId: Types.ObjectId
): Promise<IBanner> => {
    await checkAdminPermission(userId);
    
    const banner = await Banner.findByIdAndUpdate(
        bannerId, 
        { 
            ...updateData, 
            updatedBy: userId,
            updatedAt: new Date() 
        }, 
        { new: true }
    );
    
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};

export const deleteBanner = async (bannerId: string, userId: Types.ObjectId): Promise<IBanner> => {
    await checkAdminPermission(userId);
    
    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
};

export const toggleBannerStatus = async (
    bannerId: string, 
    isActive: boolean, 
    userId: Types.ObjectId
): Promise<IBanner> => {
    await checkAdminPermission(userId);
    
    const banner = await Banner.findByIdAndUpdate(
        bannerId, 
        { 
            isActive, 
            updatedBy: userId,
            updatedAt: new Date() 
        }, 
        { new: true }
    );
    
    if (!banner) {
        throw new Error("Banner not found");
    }   
    return banner;
}