import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://navasmuhammed:SNTCM2lcuvSQiz5f@madfest.i7kxhee.mongodb.net/?appName=madfest";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const dbName = process.env.MONGODB_DB || "madrasafest";

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log("✅ MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}