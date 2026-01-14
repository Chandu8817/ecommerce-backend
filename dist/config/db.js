"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const console_1 = require("console");
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongo_url = process.env.MONGO_URL;
        if (!mongo_url) {
            console.log("mongo url missing");
            throw console_1.error;
        }
        ;
        await mongoose_1.default.connect(mongo_url, {
            maxPoolSize: 20, // max concurrent connections (default is 100 in driver)
            minPoolSize: 5, //few idle connections ready
            serverSelectionTimeoutMS: 5000, // stop waiting after 5s if DB is unreachable
            socketTimeoutMS: 45000, // close sockets after 45s inactivity
        });
        console.log("MongoDB Connected");
    }
    catch (error) {
        console.log("DB connection error", error.message);
        process.exit(1);
    }
};
exports.default = connectDB;
