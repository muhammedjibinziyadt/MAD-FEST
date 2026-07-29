"use client";

import { useState } from "react";
import { Trash2, Plus, UploadCloud, Tag, Heading, Image as ImageIcon } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery-service";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface GalleryManagerProps {
  items: GalleryItem[];
  createAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function GalleryManager({ items, createAction, deleteAction }: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const file = formData.get("file") as File;
      if (!file || file.size === 0) {
        throw new Error("Please select an image file to upload.");
      }

      await createAction(formData);
      form.reset();
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo from the gallery?")) return;

    setDeletingId(id);
    setError(null);

    try {
      await deleteAction(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Upload Section */}
      <Card className="p-6">
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-fuchsia-400" />
          Add New Photo to Gallery
        </CardTitle>
        <CardDescription className="mt-2 text-white/60">
          Upload crisp images from the festival. They will be compressed to WebP and cropped for optimization.
        </CardDescription>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5 mb-2">
                <Heading className="h-4 w-4 text-fuchsia-400" /> Title / Caption
              </label>
              <Input
                type="text"
                name="title"
                placeholder="e.g. Traditional Daffmuttu Performance"
                required
                className="w-full border-white/10 bg-white/5 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5 mb-2">
                <Tag className="h-4 w-4 text-fuchsia-400" /> Category / Tag
              </label>
              <Input
                type="text"
                name="category"
                placeholder="e.g. Stage Event, Exhibition, Inauguration"
                className="w-full border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70 flex items-center gap-1.5 mb-2">
              <ImageIcon className="h-4 w-4 text-fuchsia-400" /> Image File
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-fuchsia-500/20 file:text-fuchsia-400 hover:file:bg-fuchsia-500/30 file:cursor-pointer"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-400">{error}</p>}

          <Button type="submit" disabled={isUploading} className="w-full md:w-auto">
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading & Processing...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Upload Photo
              </span>
            )}
          </Button>
        </form>
      </Card>

      {/* List Section */}
      <Card className="p-6">
        <CardTitle className="mb-6 flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-fuchsia-400" />
          Manage Gallery Photos ({items.length})
        </CardTitle>

        {items.length === 0 ? (
          <p className="text-white/60 italic text-center py-8">The gallery is currently empty.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {/* Image */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50" />

                {/* Text Info */}
                <div className="absolute top-4 left-4 right-4 text-white">
                  <h4 className="text-sm font-bold truncate">{item.title}</h4>
                  <span className="inline-block mt-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-fuchsia-400 font-semibold">
                    {item.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Image"
                  >
                    {deletingId === item.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
