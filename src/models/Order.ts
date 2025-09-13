import mongoose ,{Schema,model} from "mongoose";


export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled" | "return" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed";
export interface IOrder extends mongoose.Document {
    user : mongoose.Types.ObjectId; // Reference to User
    products: { product: mongoose.Types.ObjectId; quantity: number }[]; // Array of products with quantities
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentId: string;
    orderId: string;
    shippingAddress: string;
    paymentMethod: string;
    shippingId :string; 
    createdAt: Date;
    updatedAt: Date;

}
const orderSchema = new Schema<IOrder>({
    user: {type: Schema.Types.ObjectId,ref:"User",required:true},
    products: [{product: {type:Schema.Types.ObjectId,ref:"Product",requried:true},
    quantity: {type:Number,required:true,min:1}}],
    totalAmount: {type:Number,required:true,min:0},
    status: {type:String,enum:["pending","shipped","delivered","cancelled","return","refunded"],default:"pending"},
    paymentStatus: {type:String,enum:["pending","paid","failed"],default:"pending"},
    paymentId: {type:String,index:true},
    orderId: {type:String,index:true},
    shippingAddress: {type:String,required:true},
    paymentMethod: {type:String,required:true},
    shippingId : {type:String,index:true}, 
    createdAt: {type:Date,default:Date.now},
    updatedAt: {type:Date,default:Date.now}

})

orderSchema.index({user:1,createdAt:-1});

export const Order = model<IOrder>("Order",orderSchema);