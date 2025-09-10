import mongoose, {Schema,model} from "mongoose";
export interface IBanner extends mongoose.Document {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>({
    title: {type:String,required:true,trim:true},
    imageUrl: {type:String,required:true},
    linkUrl: {type:String},
    isActive: {type:Boolean,default:true},
    createdAt: {type:Date,default:Date.now},
    updatedAt: {type:Date,default:Date.now}
})
bannerSchema.index({isActive:1,createdAt:-1});
export const Banner = model<IBanner>("Banner",bannerSchema);