import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixIndexes = async () => {
  try {
    const mongo_url = process.env.MONGO_URL;
    if (!mongo_url) {
      console.log("MONGO_URL missing");
      process.exit(1);
    }

    await mongoose.connect(mongo_url);
    console.log("MongoDB Connected");

    const db = mongoose.connection.db;
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
    
    await mongoose.disconnect();
    console.log("Done!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error fixing indexes:", error.message);
    process.exit(1);
  }
};

fixIndexes();
