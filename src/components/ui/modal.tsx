"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  actions?: React.ReactNode;
}

export function Modal({ open, title, onClose, children, actions, size = "md" }: ModalProps) {
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm">
      <div className={cn("w-full max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-rose-500/10 backdrop-blur-2xl text-white", sizeClasses[size])}>
        <div className="mb-4 flex items-center justify-between flex-shrink-0 border-b border-white/10 pb-3">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 text-white/80 pr-1 min-h-0">{children}</div>
        {actions && <div className="mt-4 flex flex-wrap justify-end gap-3 flex-shrink-0 pt-3 border-t border-white/10">{actions}</div>}
      </div>
    </div>
  );
}

