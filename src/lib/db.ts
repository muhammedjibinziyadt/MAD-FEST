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
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseGlobal;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB ?? "madfest",
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached!.promise = null;
        throw error;
      });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

