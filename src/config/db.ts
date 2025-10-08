import mongoose from "mongoose";
import dontenv from "dotenv"
import { error } from "console";
dontenv.config();

const connectDB = async () => {
    try {
        const mongo_url = process.env.MONGO_URL;
        if (!mongo_url) {console.log("mongo url missing"); throw error};
    
        await mongoose.connect(mongo_url, {
            maxPoolSize: 20,   // max concurrent connections (default is 100 in driver)
            minPoolSize: 5,    //few idle connections ready
            serverSelectionTimeoutMS: 5000, // stop waiting after 5s if DB is unreachable
            socketTimeoutMS: 45000,         // close sockets after 45s inactivity
          });
        console.log("MongoDB Connected");
    } catch (error: any) {
        console.log("DB connection error", error.message);
        process.exit(1);
    }
}

export default connectDB;