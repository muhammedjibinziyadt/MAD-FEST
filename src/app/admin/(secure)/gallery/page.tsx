import { revalidatePath } from "next/cache";
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from "@/lib/gallery-service";
import { uploadGalleryImage } from "@/lib/upload";
import { GalleryManager } from "@/components/gallery-manager";

export const metadata = {
  title: "Admin Gallery Manager | Ishal Rabeeh Center",
};

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  async function createGalleryItemAction(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() || "General";
    const file = formData.get("file") as File | null;

    if (!title) {
      throw new Error("Title is required.");
    }
    if (!file || file.size === 0) {
      throw new Error("Please upload a valid image file.");
    }

    // Upload file
    const imageUrl = await uploadGalleryImage(file);

    // Save item in database
    await createGalleryItem({
      title,
      imageUrl,
      category,
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
  }

  async function deleteGalleryItemAction(id: string) {
    "use server";
    await deleteGalleryItem(id);
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gallery Control</h2>
        <p className="text-sm text-white/60">
          Manage the public photo gallery, upload new photos, and organize them into categories.
        </p>
      </div>
      <GalleryManager
        items={items}
        createAction={createGalleryItemAction}
        deleteAction={deleteGalleryItemAction}
      />
    </div>
  );
}
