import { twMerge } from "tailwind-merge";

export function cn(
  ...classes: Array<string | undefined | null | false | Record<string, boolean>>
) {
  const merged = classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === "string") return [cls];
      return Object.entries(cls)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .join(" ")
    .trim();
  
  return twMerge(merged);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

import type { ResultRecord } from "./types";

/**
 * Groups result records by unique program_id.
 * Merges entries and penalties from multiple submissions into a single record per program.
 */
export function groupResultsByProgram(results: ResultRecord[]): ResultRecord[] {
  if (!results || results.length === 0) return [];

  const map = new Map<string, ResultRecord>();

  for (const result of results) {
    const pId = String(result.program_id);
    const existing = map.get(pId);

    if (!existing) {
      map.set(pId, {
        ...result,
        entries: [...(result.entries || [])],
        penalties: [...(result.penalties || [])],
      });
    } else {
      // Merge entries - prevent duplicates based on position + (student_id or team_id)
      const existingEntryKeys = new Set(
        existing.entries.map((e) => `${e.position}-${e.student_id || e.team_id || ""}`),
      );

      for (const entry of result.entries || []) {
        const key = `${entry.position}-${entry.student_id || entry.team_id || ""}`;
        if (!existingEntryKeys.has(key)) {
          existing.entries.push(entry);
          existingEntryKeys.add(key);
        }
      }

      // Merge penalties - prevent duplicates based on target + points
      const existingPenaltyKeys = new Set(
        (existing.penalties || []).map((p) => `${p.student_id || p.team_id || ""}-${p.points}`),
      );

      for (const penalty of result.penalties || []) {
        const key = `${penalty.student_id || penalty.team_id || ""}-${penalty.points}`;
        if (!existingPenaltyKeys.has(key)) {
          existing.penalties = existing.penalties || [];
          existing.penalties.push(penalty);
          existingPenaltyKeys.add(key);
        }
      }

      // Keep latest timestamp
      if (
        result.submitted_at &&
        (!existing.submitted_at ||
          new Date(result.submitted_at).getTime() > new Date(existing.submitted_at).getTime())
      ) {
        existing.submitted_at = result.submitted_at;
      }
    }
  }

  // Sort entries within each program result by position (1st, 2nd, 3rd)
  return Array.from(map.values()).map((record) => ({
    ...record,
    entries: [...record.entries].sort((a, b) => a.position - b.position),
  }));
}

