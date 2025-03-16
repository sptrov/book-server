import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default class Database {
  public static async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("Mongo URI is missing.Please check configuration");
      }
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}
