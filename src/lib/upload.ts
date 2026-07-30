import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "students");
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

export async function uploadFile(file: File, type: "image" | "audio"): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    await mkdir(UPLOAD_DIR, { recursive: true });

    if (type === "image") {
        const filename = `${randomUUID()}.webp`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Compress image to WebP with high quality but small dimensions and save to disk
        await sharp(buffer)
            .resize(400, 400, { fit: "inside", withoutEnlargement: true }) // Max 400x400
            .webp({ quality: 80 }) // 80% quality is highly optimized but very lightweight
            .toFile(filepath);

        return `/uploads/students/${filename}`;
    } else {
        // Save audio locally
        const ext = file.name.split(".").pop() || "mp3";
        const filename = `${randomUUID()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await writeFile(filepath, buffer);
        return `/uploads/students/${filename}`;
    }
}

export async function deleteFile(fileUrl: string) {
    if (!fileUrl || fileUrl.startsWith("data:")) return; // Skip legacy base64 data URL
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
    await mkdir(GALLERY_UPLOAD_DIR, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const filepath = path.join(GALLERY_UPLOAD_DIR, filename);

    // Compress gallery image to WebP and save to disk
    await sharp(buffer)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(filepath);

    return `/uploads/gallery/${filename}`;
}

export async function deleteGalleryFile(fileUrl: string) {
    if (!fileUrl || fileUrl.startsWith("data:")) return; // Skip legacy base64 data URL
    try {
        const filename = fileUrl.split("/").pop();
        if (!filename) return;
        const filepath = path.join(GALLERY_UPLOAD_DIR, filename);
        await unlink(filepath);
    } catch (error) {
        console.error("Failed to delete gallery file:", error);
    }
}

