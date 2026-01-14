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

const bannerSchema = new Schema<IBanner>({
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String },
    linkUrl: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    offer: { type: String },
    coupon: { type: String },
    
   
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
bannerSchema.index({isActive:1,createdAt:-1});
export const Banner = model<IBanner>("Banner",bannerSchema);