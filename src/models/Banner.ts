import mongoose, {Schema,model} from "mongoose";

export enum BannerType {
    HERO = 'hero',
    PROMO_BANNER = 'promo_banner',
    SIDEBAR_BANNER = 'sidebar_banner'
}

export enum BannerPosition {
    TOP = 'top',
    MIDDLE = 'middle',
    BOTTOM = 'bottom'
}

export interface IBanner extends mongoose.Document {
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    linkUrl?: string;
    buttonText?: string;
    type: BannerType;
    position: BannerPosition;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    priority: number;
    tags: string[];
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String },
    linkUrl: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    type: { 
        type: String, 
        enum: Object.values(BannerType),
        default: BannerType.HERO
    },
    position: { 
        type: String, 
        enum: Object.values(BannerPosition),
        default: BannerPosition.TOP
    },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
bannerSchema.index({isActive:1,createdAt:-1});
export const Banner = model<IBanner>("Banner",bannerSchema);