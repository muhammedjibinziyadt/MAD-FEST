import fs from "fs";
import path from "path";

// Load .env variables manually
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
} catch (e) {
  console.error("Could not load .env file:", e);
}

import { connectDB } from "../src/lib/db";
import { TeamModel, StudentModel, ProgramModel } from "../src/lib/models";
import { v2 as cloudinary } from "cloudinary";
import Pusher from "pusher";

async function checkAllServices() {
  console.log("==========================================");
  console.log("🔍 STARTING COMPREHENSIVE SERVICE AUDIT...");
  console.log("==========================================\n");

  let dbOk = false;
  let cloudinaryOk = false;
  let pusherOk = false;

  // 1. TEST MONGODB DATABASE
  try {
    console.log("1️⃣ Testing MongoDB Database Connection & Queries...");
    await connectDB();
    const teamCount = await TeamModel.countDocuments();
    const studentCount = await StudentModel.countDocuments();
    const programCount = await ProgramModel.countDocuments();
    console.log(`   ✅ DB Connected successfully!`);
    console.log(`   📊 Stats: ${teamCount} Teams | ${studentCount} Students | ${programCount} Programs`);
    dbOk = true;
  } catch (err: any) {
    console.error("   ❌ MongoDB Error:", err.message || err);
  }

  console.log("");

  // 2. TEST CLOUDINARY
  try {
    console.log("2️⃣ Testing Cloudinary API & Image Upload...");
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("   ⚠️ Cloudinary credentials missing in .env! (Will fallback to local disk storage)");
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      // Ping Cloudinary via sample 1x1 transparent GIF upload
      const testImageBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const uploadRes = await cloudinary.uploader.upload(testImageBase64, {
        folder: "test_audit",
        timeout: 15000,
      });

      console.log(`   ✅ Cloudinary Upload SUCCESS!`);
      console.log(`   📷 Test Image URL: ${uploadRes.secure_url}`);

      // Clean up test image
      await cloudinary.uploader.destroy(uploadRes.public_id);
      console.log(`   🗑️ Test image deleted from Cloudinary.`);
      cloudinaryOk = true;
    }
  } catch (err: any) {
    console.error("   ❌ Cloudinary API Error:", err.message || err);
  }

  console.log("");

  // 3. TEST PUSHER
  try {
    console.log("3️⃣ Testing Pusher Credentials & Trigger...");
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

    if (!appId || !key || !secret) {
      console.warn("   ⚠️ Pusher environment variables missing in .env!");
    } else {
      const pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });

      const triggerPromise = pusher.trigger("test-channel", "test-event", {
        message: "Audit test event",
        timestamp: new Date().toISOString(),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Pusher connection timeout (5s limit reached)")), 5000)
      );

      const response: any = await Promise.race([triggerPromise, timeoutPromise]);

      if (response && response.status === 200) {
        console.log(`   ✅ Pusher Trigger SUCCESS! (HTTP Status 200)`);
        pusherOk = true;
      } else {
        console.warn(`   ⚠️ Pusher response status: ${response?.status}`);
      }
    }
  } catch (err: any) {
    console.error("   ❌ Pusher Error:", err.message || err);
  }

  console.log("\n==========================================");
  console.log("📋 SERVICE AUDIT SUMMARY:");
  console.log(`   MongoDB Database : ${dbOk ? "✅ WORKING" : "❌ FAILED"}`);
  console.log(`   Cloudinary       : ${cloudinaryOk ? "✅ WORKING" : "❌ FAILED"}`);
  console.log(`   Pusher Realtime  : ${pusherOk ? "✅ WORKING" : "❌ FAILED"}`);
  console.log("==========================================\n");

  process.exit(dbOk && cloudinaryOk && pusherOk ? 0 : 1);
}

checkAllServices();
