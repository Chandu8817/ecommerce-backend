import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt"

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" }
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