import mongoose from "mongoose";
import dontenv from "dotenv"
import { error } from "console";
dontenv.config();

const connectDB = async () => {
    try {
        const mongo_url = process.env.MONGO_URL;
        if (!mongo_url) {console.log("mongo url missing"); throw error};
        await mongoose.connect(mongo_url)
        console.log("MongoDB Connected");
    } catch (error: any) {
        console.log("DB connection error", error.message);
        process.exit(1);
    }
}

export default connectDB;