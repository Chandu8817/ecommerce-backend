import { Types } from "mongoose";
import {Banner,IBanner} from "../models/Banner";
import { User } from "../models/User";

export const createBanner = async (bannerInput: Partial<IBanner>,userId:Types.ObjectId) => {
    
     //check user role admin
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role != "admin") {
        throw new Error("User not have this role");
    }

    const banner = await Banner.create(bannerInput);
    return banner;
}
export const getBanners = async (take: number = 10, skip: number = 0) => {
    const banners = await Banner.find().skip(skip).limit(take).sort({ createdAt: -1 });
    return banners;
}
export const getActiveBanners = async (take: number = 10, skip: number = 0) => {
    const banners = await Banner.find({ isActive: true }).skip(skip).limit(take).sort({ createdAt: -1 });
    return banners;
}
export const getBannerById = async (bannerId: string) => {
    const banner = await Banner.findById(bannerId);
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
}
export const updateBanner = async (bannerId: string, updateData: Partial<IBanner>) => {
    const banner = await Banner.findByIdAndUpdate(bannerId, updateData, { new: true });
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
}
export const deleteBanner = async (bannerId: string) => {
    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
        throw new Error("Banner not found");
    }
    return banner;
}
export const toggleBannerStatus = async (bannerId: string, isActive: boolean) => {
    const banner = await Banner.findByIdAndUpdate(bannerId, { isActive }, { new: true });
    if (!banner) {
        throw new Error("Banner not found");
    }   
    return banner;
}