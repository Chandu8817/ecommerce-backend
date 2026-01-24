"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fixIndexes = async () => {
    try {
        const mongo_url = process.env.MONGO_URL;
        if (!mongo_url) {
            console.log("MONGO_URL missing");
            process.exit(1);
        }
        await mongoose_1.default.connect(mongo_url);
        console.log("MongoDB Connected");
        const db = mongoose_1.default.connection.db;
        const collection = db?.collection("products");
        if (!collection) {
            console.log("Products collection not found");
            process.exit(1);
        }
        // Drop all existing indexes except _id
        console.log("Dropping existing indexes...");
        await collection.dropIndexes();
        console.log("All indexes dropped successfully");
        // The new indexes will be automatically created when the server starts
        console.log("Indexes will be recreated on next server start");
        await mongoose_1.default.disconnect();
        console.log("Done!");
        process.exit(0);
    }
    catch (error) {
        console.error("Error fixing indexes:", error.message);
        process.exit(1);
    }
};
fixIndexes();
