"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamLeadersShowcaseProps {
  teams: Team[];
}

const TEAM_IMAGES: Record<string, string> = {
  "SAMARQAND": "/img/teams/SAMARKAND.png",
  "NAHAVAND": "/img/teams/NAHAVAND.png",
  "YAMAMA": "/img/teams/YAMAMAH.png",
  "QURTUBA": "/img/teams/QURTHUBA.png",
  "MUQADDAS": "/img/teams/MUQADDAS.png",
  "BUKHARA": "/img/teams/BUKHARA.png",
};

export function TeamLeadersShowcase({ teams }: TeamLeadersShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % teams.length);
  }, [teams.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? teams.length - 1 : prev - 1));
  }, [teams.length]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const getImage = (teamName: string) => {
    // Normalize string to match keys (uppercase)
    const normalized = teamName.toUpperCase();
    return TEAM_IMAGES[normalized];
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: {
        duration: 0.5,
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
      transition: {
        duration: 0.5,
      }
    })
  };

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden bg-white ">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100/50 shadow-sm"
          >
            <Crown className="w-4 h-4 text-[#8B4513]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#8B4513] uppercase">Team Captains</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 tracking-tight"
          >
            Meet The <span className="text-[#8B4513]">Leaders</span>
          </motion.h2>
        </div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto h-[400px] sm:h-[500px] flex items-center justify-center perspective-1000">

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white text-gray-800 transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full max-w-sm sm:max-w-md md:max-w-lg aspect-3/4 sm:aspect-4/5 md:aspect-square flex items-center justify-center"
            >
              <div className="relative w-full h-full drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src={getImage(teams[currentIndex]?.name || "")}
                  alt={teams[currentIndex]?.name || "Team Captain"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        {/* Pagination Dots - Dynamic Sliding Window */}
        <div className="flex justify-center items-center gap-4 mt-8 h-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {[
              (currentIndex - 1 + teams.length) % teams.length,
              currentIndex,
              (currentIndex + 1) % teams.length,
            ].map((idx, position) => {
              const isCurrent = idx === currentIndex;
              return (
                <motion.button
                  layout
                  key={`dot-${idx}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isCurrent ? 1 : 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  onClick={() => {
                    if (isCurrent) return;
                    setDirection(position === 2 ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    "rounded-full transition-colors duration-300",
                    isCurrent
                      ? "w-2 h-2 bg-[#8B4513] shadow-md z-10"
                      : "w-1 h-1 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={isCurrent ? "Current team" : `Go to team ${idx + 1}`}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
