import mongoose from "mongoose";
import { model,Schema,Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
    name: {type:String,required:true,trim:true},
    slug: {type:String,required:true,trim:true},
    image: {type:String,required:true},
    createdAt: {type:Date,default:Date.now},
    updatedAt: {type:Date,default:Date.now}
})
categorySchema.index({name:1,slug:1,createdAt:-1});
export const Category = model<ICategory>("Category",categorySchema);
