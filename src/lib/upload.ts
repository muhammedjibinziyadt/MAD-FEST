import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "students");
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  const base64Str = `data:image/webp;base64,${buffer.toString("base64")}`;
  const maxAttempts = 3;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(base64Str, {
        folder,
        timeout: 120000,
      });
      return result.secure_url;
    } catch (error) {
      console.warn(`Cloudinary upload attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) {
        console.error("All Cloudinary upload attempts failed.");
        throw error;
      }
      await delay(500 * Math.pow(2, attempt - 1));
    }
  }
  throw new Error("Cloudinary upload failed after retries");
}

function getPublicIdFromUrl(url: string): string | null {
  if (!url.includes("cloudinary.com")) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const pathPart = parts[1];
  const segments = pathPart.split("/");
  if (segments[0].match(/^v\d+$/)) {
    segments.shift();
  }
  const publicIdWithExt = segments.join("/");
  const lastDot = publicIdWithExt.lastIndexOf(".");
  if (lastDot === -1) return publicIdWithExt;
  return publicIdWithExt.substring(0, lastDot);
}

async function deleteFromCloudinary(url: string) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted ${publicId} from Cloudinary`);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }
}

export async function uploadFile(file: File, type: "image" | "audio"): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isCloudinaryConfigured) {
    try {
      if (type === "image") {
        const processedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        return await uploadToCloudinary(processedBuffer, "students");
      } else {
        const base64Str = `data:audio/mpeg;base64,${buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64Str, {
          folder: "students",
          resource_type: "auto",
          timeout: 120000
        });
        return result.secure_url;
      }
    } catch (cloudinaryError) {
      const errMsg = cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError);
      console.warn("⚠️ Cloudinary upload failed, falling back to local disk storage:", errMsg);
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  if (type === "image") {
    const filename = `${randomUUID()}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await sharp(buffer)
      .resize(400, 400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `/uploads/students/${filename}`;
  } else {
    const ext = file.name.split(".").pop() || "mp3";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);
    return `/uploads/students/${filename}`;
  }
}

export async function deleteFile(fileUrl: string) {
  if (!fileUrl || fileUrl.startsWith("data:")) return;

  if (isCloudinaryConfigured && fileUrl.includes("cloudinary.com")) {
    await deleteFromCloudinary(fileUrl);
    return;
  }

  try {
    const filename = fileUrl.split("/").pop();
    if (!filename) return;
    const filepath = path.join(UPLOAD_DIR, filename);
    await unlink(filepath);
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}

export async function uploadGalleryImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isCloudinaryConfigured) {
    try {
      const processedBuffer = await sharp(buffer)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      return await uploadToCloudinary(processedBuffer, "gallery");
    } catch (cloudinaryError) {
      const errMsg = cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError);
      console.warn("⚠️ Cloudinary gallery upload failed, falling back to local disk storage:", errMsg);
    }
  }

  await mkdir(GALLERY_UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(GALLERY_UPLOAD_DIR, filename);

  await sharp(buffer)
    .resize(800, 600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  return `/uploads/gallery/${filename}`;
}

export async function deleteGalleryFile(fileUrl: string) {
  if (!fileUrl || fileUrl.startsWith("data:")) return;

  if (isCloudinaryConfigured && fileUrl.includes("cloudinary.com")) {
    await deleteFromCloudinary(fileUrl);
    return;
  }

  try {
    const filename = fileUrl.split("/").pop();
    if (!filename) return;
    const filepath = path.join(GALLERY_UPLOAD_DIR, filename);
    await unlink(filepath);
  } catch (error) {
    console.error("Failed to delete gallery file:", error);
  }
}
