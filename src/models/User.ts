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
    phone?: string;
    googleId?: string;
    picture?: string;
    password?: string;
    role: "user" | "admin";
    shippingAddress: IShippingAddress[];
    matchPassword(enteredPassword: string): Promise<boolean>;
}





const userSchema = new Schema<IUser>(
    {
        name: { type: String },
        email: { type: String, sparse: true, unique: true },
        phone: { type: String, sparse: true, unique: true },
        googleId: { type: String, sparse: true, unique: true },
        picture: { type: String },
        password: { type: String },
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