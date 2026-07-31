"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Tag, Calendar } from "lucide-react";
import type { GalleryItem } from "@/lib/gallery-service";
import { cn } from "@/lib/utils";

interface GalleryViewProps {
  items: GalleryItem[];
}

export function GalleryView({ items }: GalleryViewProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Dynamically compile categories
  const categories = useMemo(() => {
    const allCats = items.map((item) => item.category);
    const uniqueCats = Array.from(new Set(allCats)).filter(Boolean);
    return ["All", ...uniqueCats];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex === null) return;
    const nextIndex = (selectedItemIndex + 1) % filteredItems.length;
    setSelectedItemIndex(nextIndex);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedItemIndex === null) return;
    const prevIndex = (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItemIndex(prevIndex);
  };

  const selectedItem = selectedItemIndex !== null ? filteredItems[selectedItemIndex] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8B4513]/70">
          Capture the Moments
        </span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Event Gallery
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
          Explore the vibrant highlights, stage performances, and memorable captures from Ishal Rabeeh.
        </p>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setSelectedItemIndex(null);
              }}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
                activeCategory === category
                  ? "bg-[#8B4513] text-white shadow-md shadow-[#8B4513]/25"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 p-8 text-center backdrop-blur-xs">
          <p className="text-lg font-medium text-gray-500">No photos in this category yet.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedItemIndex(index)}
                className="group relative aspect-[3/2] cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                {/* Image */}
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 opacity-90 transition-opacity duration-300" />

                {/* Top-Left Title/Heading Overlay (matching user screenshot) */}
                <div className="absolute top-4 left-4 right-4 flex flex-col pointer-events-none">
                  <span className="text-sm font-semibold tracking-wide text-white drop-shadow-md line-clamp-1 leading-snug">
                    {item.title}
                  </span>
                  {item.category && (
                    <span className="mt-1 inline-flex items-center text-[10px] uppercase tracking-widest text-[#f59e0b] drop-shadow-xs font-semibold">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Hover Maximize Icon */}
                <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-xs transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/20">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItemIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemIndex(null)}
              className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left Control */}
            {filteredItems.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 md:left-6"
                aria-label="Previous"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
            )}

            {/* Content Area */}
            <div
              className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />

              {/* Caption Overlay */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-6 w-full max-w-2xl rounded-2xl bg-white/5 border border-white/10 p-5 text-white backdrop-blur-md"
              >
                <h3 className="text-xl font-bold tracking-wide">{selectedItem.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-[#f59e0b]">
                    <Tag className="h-3.5 w-3.5" />
                    {selectedItem.category}
                  </span>
                  {selectedItem.createdAt && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Control */}
            {filteredItems.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 md:right-6"
                aria-label="Next"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
