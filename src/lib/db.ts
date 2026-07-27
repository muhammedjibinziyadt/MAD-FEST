import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ??
  "mongodb+srv://jdsaadmin:jdsaadmin9544@madfest.khdsxcz.mongodb.net/madfest?retryWrites=true&w=majority&appName=madfest";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  mongooseListenersAdded?: boolean;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseGlobal;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

if (!globalWithMongoose.mongoose?.mongooseListenersAdded) {
  if (globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose.mongooseListenersAdded = true;
  }
  mongoose.connection.on("disconnected", () => {
    if (cached) {
      cached.conn = null;
      cached.promise = null;
    }
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
    if (cached) {
      cached.conn = null;
      cached.promise = null;
    }
  });
}

export async function connectDB() {
  if (cached?.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 2 && cached?.promise) {
    return await cached.promise;
  }

  // Clear stale cached state if connection was dropped
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }

  const promise = mongoose
    .connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB ?? "madfest",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    })
    .then((mongooseInstance) => {
      if (cached) {
        cached.conn = mongooseInstance;
      }
      return mongooseInstance;
    })
    .catch((error) => {
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }
      throw error;
    });

  if (cached) {
    cached.promise = promise;
  }

  return await promise;
}

