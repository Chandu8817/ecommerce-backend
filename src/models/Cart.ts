import {Schema,model,Document, Types} from "mongoose";

export interface ICart extends Document{
    userId: Types.ObjectId;
    items: {
        productId: Types.ObjectId;
        quantity: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    
}

const cartSchema = new Schema({
    userId: {type: Types.ObjectId,ref:"User",required:true},
    items: [{productId: {type: Types.ObjectId,ref:"Product",required:true},quantity: {type: Number,required:true,min:1}}],
    createdAt: {type: Date,default:Date.now},
    updatedAt: {type: Date,default:Date.now}
})
cartSchema.index({userId:1,createdAt:-1});
export const Cart = model<ICart>("Cart",cartSchema);