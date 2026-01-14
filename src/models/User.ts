import { model, Schema } from "mongoose";
import bcrypt from "bcrypt"

export interface IShippingAddress {
    name: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    phone: string,
    isDefault: boolean,
}


export interface IUser extends Document {
    _id: string;
    name?: string;
    email?: string;
    phone: string;
    password?: string;
    role: "user" | "admin";
    otp?: string;
    otpExpiresAt?: Date;
    shippingAddress: IShippingAddress[];
    matchPassword(enteredPassword: string): Promise<boolean>;
}





const userSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, sparse: true, unique: true },
        phone: { type: String, required: true, unique: true },
        password: { type: String },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        shippingAddress: { type: [{
            name: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
            phone: String,
            isDefault: Boolean,
        }], default: [] },
    }, { timestamps: true }
)


userSchema.methods.matchPassword = function (enterPassword: string) {
    return bcrypt.compare(enterPassword, this.password)
}


export const User = model<IUser>("User", userSchema);