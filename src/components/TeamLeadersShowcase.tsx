"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const leaders = [
  "/img/leaders/leader-1-transparent.png?v=2",
  "/img/leaders/leader-2-transparent.png?v=2",
  "/img/leaders/leader-3-transparent.png?v=2",
];

export function TeamLeadersShowcase() {
  const [activeIndex, setActiveIndex] = useState(1); // Default to the middle image

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === 2 ? 0 : prev + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex]); // Recreates interval on index change to reset timer

  const getCardStyle = (index: number) => {
    let diff = index - activeIndex;
    // Handle wrapping around for 3 items
    if (diff === -2) diff = 1;
    if (diff === 2) diff = -1;

    let translateX = "-50%";
    if (diff === -1) {
      translateX = "calc(-50% - var(--carousel-offset, 60%))";
    } else if (diff === 1) {
      translateX = "calc(-50% + var(--carousel-offset, 60%))";
    }

    return {
      transform: `translate(${translateX}, -50%) scale(${diff === 0 ? 1.28 : 0.72})`,
      opacity: diff === 0 ? 1 : 0.25,
      zIndex: diff === 0 ? 20 : 10,
    };
  };

  return (
    <section className="relative py-8 md:py-16 overflow-hidden bg-[#FFFCF5] border-t border-b border-[#8B4513]/10">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#8B4513]/5 blur-[120px] rounded-full opacity-40" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl text-center mb-2 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#3A2D28] leading-tight tracking-tight">
          ഞങ്ങളുടെ മെന്റർമാരും നായകന്മാരും
        </h2>
      </div>

      {/* Interactive 3D Carousel */}
      <div className="carousel-container relative max-w-5xl mx-auto px-1 sm:px-4 flex items-center justify-between gap-1 sm:gap-4 py-4 sm:py-8 z-10">
        
        {/* Left Navigation Button */}
        <button
          onClick={handlePrev}
          className="p-2 md:p-3 rounded-full border border-[#8B4513]/20 bg-white/90 hover:bg-white text-[#8B4513] shadow-md transition-all active:scale-90 hover:scale-105 shrink-0 z-30 cursor-pointer"
          aria-label="Previous Team Leader"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Carousel Visual Area */}
        <div className="relative flex-1 h-[290px] sm:h-[350px] md:h-[410px] overflow-visible">
          {leaders.map((img, i) => {
            const isActive = i === activeIndex;
            const style = getCardStyle(i);

            return (
              <div
                key={i}
                onClick={() => {
                  if (!isActive) setActiveIndex(i);
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "88%",
                  maxWidth: "540px",
                  transition: "all 600ms cubic-bezier(0.25, 1, 0.5, 1)",
                  ...style,
                }}
                className={`aspect-[3/2] cursor-pointer select-none origin-center`}
                suppressHydrationWarning
              >
                <div className="relative w-full h-full" suppressHydrationWarning>
                  <Image
                    src={img}
                    alt={`Team Leader ${i + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 340px, 480px"
                    className={`object-contain transition-all duration-600 ${
                      isActive 
                        ? "filter drop-shadow-[0_15px_15px_rgba(139,69,19,0.18)]" 
                        : "filter drop-shadow-sm"
                    }`}
                    priority
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={handleNext}
          className="p-2 md:p-3 rounded-full border border-[#8B4513]/20 bg-white/90 hover:bg-white text-[#8B4513] shadow-md transition-all active:scale-90 hover:scale-105 shrink-0 z-30 cursor-pointer"
          aria-label="Next Team Leader"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Pagination dots indicator */}
      <div className="flex justify-center items-center gap-2 mt-4 z-20 relative">
        {leaders.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === activeIndex 
                ? "bg-[#8B4513] w-6" 
                : "bg-[#8B4513]/30 hover:bg-[#8B4513]/55"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
