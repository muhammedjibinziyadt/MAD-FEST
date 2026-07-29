import { randomUUID } from "node:crypto";
import { connectDB } from "./db";
import { GalleryModel } from "./models";
import { getCached, setCached, clearCache } from "./data-cache";
import { deleteGalleryFile } from "./upload";

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const cached = getCached<GalleryItem[]>("gallery");
  if (cached) return cached;

  await connectDB();
  let items = await GalleryModel.find().lean().sort({ createdAt: -1 });

  // If empty, seed our initial image
  if (items.length === 0) {
    const seedItem = {
      id: "seed-exhibition",
      title: "Islamic Calligraphy Exhibition",
      imageUrl: "/uploads/gallery/exhibition.png",
      category: "Exhibition",
    };
    await GalleryModel.create(seedItem);
    items = [seedItem as any];
  }

  const mapped = items.map((item: any) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    category: item.category || "General",
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
  }));

  return setCached("gallery", mapped);
}

export async function createGalleryItem(input: {
  title: string;
  imageUrl: string;
  category?: string;
}): Promise<GalleryItem> {
  await connectDB();
  const record = {
    id: randomUUID(),
    title: input.title,
    imageUrl: input.imageUrl,
    category: input.category || "General",
  };

  const created = await GalleryModel.create(record);
  clearCache("gallery");

  return {
    id: created.id,
    title: created.title,
    imageUrl: created.imageUrl,
    category: created.category,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await connectDB();
  const record = (await GalleryModel.findOne({ id }).lean()) as any;
  if (record) {
    await deleteGalleryFile(record.imageUrl);
    await GalleryModel.deleteOne({ id });
    clearCache("gallery");
  }
}
