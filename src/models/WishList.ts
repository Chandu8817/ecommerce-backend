import {Schema,model,Document,Types} from "mongoose";

export interface IWishList extends Document{
    userId: Types.ObjectId;
    products: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const wishListSchema = new Schema({
    userId: {type: Types.ObjectId,ref:"User",required:true},
    products: [{type: Types.ObjectId,ref:"Product",required:true}],
    createdAt: {type: Date,default:Date.now},
    updatedAt: {type: Date,default:Date.now}
})
wishListSchema.index({userId:1,createdAt:-1});
export const WishList = model<IWishList>("WishList",wishListSchema);
