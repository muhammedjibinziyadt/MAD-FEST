import { getGalleryItems } from "@/lib/gallery-service";
import { GalleryView } from "@/components/gallery-view";

export const metadata = {
  title: "Photo Gallery | Ishal Rabeeh",
  description: "View the beautiful photo highlights, performances, and art exhibitions from the Ishal Rabeeh fest.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="min-h-screen bg-[#fffcf5] py-10 lg:pl-28">
      <GalleryView items={items} />
    </main>
  );
}
