import {Schema,model,Document,Types} from "mongoose";

export interface IReview extends Document{
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema({
    userId: {type: Types.ObjectId,ref:"User",required:true},
    productId: {type: Types.ObjectId,ref:"Product",required:true},
    rating: {type: Number,required:true,min:1,max:5},
    comment: {type: String,required:true},
    createdAt: {type: Date,default:Date.now},
    updatedAt: {type: Date,default:Date.now}
})
reviewSchema.index({userId:1,productId:1,createdAt:-1});
export const Review = model<IReview>("Review",reviewSchema);
