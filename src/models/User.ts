import mongoose, { model, Schema } from "mongoose";
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
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    shippingAddress: IShippingAddress[];
    matchPassword(enteredPassword: string): Promise<boolean>;
}





const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
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

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)

    next();
})

userSchema.methods.matchPassword = function (enterPassword: string) {
    return bcrypt.compare(enterPassword, this.password)
}


export const User = model<IUser>("User", userSchema);