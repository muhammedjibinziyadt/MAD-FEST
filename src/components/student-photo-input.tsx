"use client";

import { useState } from "react";

export function StudentPhotoInput() {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG, or WEBP images are allowed.");
      e.target.value = ""; // Clear the file input
      return;
    }

    // Limit to 2 MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB. Please select a smaller file.");
      e.target.value = ""; // Clear the file input
      return;
    }

    setError(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 file:cursor-pointer h-10 flex items-center"
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
