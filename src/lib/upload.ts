import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "students");

export async function uploadFile(file: File, type: "image" | "audio"): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (type === "image") {
        // Compress image to WebP with high quality but small dimensions to fit in MongoDB efficiently
        const webpBuffer = await sharp(buffer)
            .resize(400, 400, { fit: "inside", withoutEnlargement: true }) // Max 400x400
            .webp({ quality: 80 }) // 80% quality is highly optimized but very lightweight
            .toBuffer();

        const base64 = webpBuffer.toString("base64");
        return `data:image/webp;base64,${base64}`;
    } else {
        // Save audio locally (fallback)
        await mkdir(UPLOAD_DIR, { recursive: true });
        const ext = file.name.split(".").pop() || "mp3";
        const filename = `${randomUUID()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await writeFile(filepath, buffer);
        return `/uploads/students/${filename}`;
    }
}

export async function deleteFile(fileUrl: string) {
    if (!fileUrl || fileUrl.startsWith("data:")) return; // Base64 data in MongoDB has no local file to delete
    try {
        const filename = fileUrl.split("/").pop();
        if (!filename) return;
        const filepath = path.join(UPLOAD_DIR, filename);
        await unlink(filepath);
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
}

