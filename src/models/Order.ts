import mongoose, { Schema, model } from "mongoose";

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "return" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed";
export interface IOrder extends mongoose.Document {
    user: mongoose.Types.ObjectId; // Reference to User
    products: { product: mongoose.Types.ObjectId; quantity: number }[]; // Array of products with quantities
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentId: string;
    orderId: string;
    shippingAddress: {
        type: Object,
        required: true
    },
    shippingProvider: { type: String, default: "shiprocket" },
shippingOrderId: String,
awbCode: String,
courierName: String,
trackingUrl: String,
shipmentStatus: String
    paymentMethod: string;
    shippingId: string;
    createdAt: Date;
    updatedAt: Date;

}


const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false } // important
);

const orderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: "Product", requried: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled", "return", "refunded"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId: { type: String, index: true },
    orderId: { type: String, index: true },
   shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
    shippingProvider: { type: String, default: "shiprocket" },
    shippingOrderId: { type: String, index: true },
    awbCode: { type: String, index: true },
    courierName: { type: String },
    trackingUrl: { type: String },
    shipmentStatus: { type: String },
    paymentMethod: { type: String, required: true },
    shippingId: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

})

orderSchema.index({ user: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);