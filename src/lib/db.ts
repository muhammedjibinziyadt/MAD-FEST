import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://navasmuhammed:SNTCM2lcuvSQiz5f@madfest.i7kxhee.mongodb.net/?appName=madfest";

const dbName = process.env.MONGODB_DB || "madrasafest";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}

let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected");
      return mongooseInstance;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("\n❌ MONGODB CONNECTION ERROR!");
    console.error("👉 Please verify: ");
    console.error("   1. You are connected to the Internet.");
    console.error("   2. Your current IP address is whitelisted in MongoDB Atlas Network Access (Settings -> Network Access -> Add IP -> Allow Access From Anywhere).");
    console.error("   3. Your MONGODB_URI in the .env file is correct.\n");
    throw e;
  }
  return cached.conn;
}