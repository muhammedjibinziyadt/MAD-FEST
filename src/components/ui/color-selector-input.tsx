"use client";

import React, { useState } from "react";
import { PRESET_TEAM_THEMES } from "@/lib/team-colors";

interface ColorSelectorInputProps {
  name?: string;
  defaultValue?: string;
  className?: string;
}

export function ColorSelectorInput({
  name = "themeColor",
  defaultValue = "#E11D48",
  className = "",
}: ColorSelectorInputProps) {
  const [selectedColor, setSelectedColor] = useState(defaultValue || "#E11D48");

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-semibold text-white/70 block">
        Team Theme Color
      </label>
      
      {/* Preset Swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TEAM_THEMES.map((preset) => {
          const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
          return (
            <button
              key={preset.hex}
              type="button"
              title={preset.name}
              onClick={() => setSelectedColor(preset.hex)}
              className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center border ${
                isSelected
                  ? "scale-110 border-white ring-2 ring-white/50 shadow-md"
                  : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
              }`}
              style={{ backgroundColor: preset.hex }}
            >
              {isSelected && (
                <span className="text-white text-xs font-bold shadow-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2 mt-2">
        <div className="relative flex-1">
          <input
            type="text"
            name={name}
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            placeholder="#E11D48"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-fuchsia-400/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
          />
        </div>
        <div className="relative w-10 h-10 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0 cursor-pointer">
          <input
            type="color"
            value={selectedColor.startsWith("#") ? selectedColor : "#E11D48"}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="absolute inset-0 w-16 h-16 -top-3 -left-3 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>
    </div>
  );
}
