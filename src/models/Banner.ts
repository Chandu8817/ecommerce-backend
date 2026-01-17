import mongoose, {Schema,model} from "mongoose";



export interface IBanner extends mongoose.Document {
    title: string;
    subtitle?: string;
    description?: string;
    offer?: string;
    coupon?: string;
    linkUrl?: string;
    imageUrl: string;
    mobileImageUrl?: string;
    buttonText?: string;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        description: { type: String, trim: true },
        imageUrl: { type: String, required: true },
        mobileImageUrl: { type: String, trim: true },
        linkUrl: { type: String, trim: true },
        buttonText: { type: String, default: 'Shop Now', trim: true },
        offer: { type: String, trim: true },
        coupon: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date },
        isActive: { type: Boolean, default: true, index: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

bannerSchema.index({ isActive: 1, createdAt: -1 });
bannerSchema.index({ createdBy: 1 });
export const Banner = model<IBanner>("Banner",bannerSchema);