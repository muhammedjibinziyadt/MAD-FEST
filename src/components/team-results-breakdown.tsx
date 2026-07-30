"use client";

import { useState, useMemo } from "react";
import { Trophy, Award, Search, CheckCircle2, Clock, XCircle, Tag, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TeamResultItem {
  id: string;
  registrationId: string;
  studentId?: string;
  studentName: string;
  studentChest: string;
  programId: string;
  programName: string;
  category: string;
  section: string;
  status: "won" | "lost" | "pending";
  position: 1 | 2 | 3 | null;
  grade?: string;
  score: number;
}

interface TeamResultsBreakdownProps {
  items: TeamResultItem[];
  onCloseLink?: string;
}

export function TeamResultsBreakdown({ items, onCloseLink }: TeamResultsBreakdownProps) {
  const [filter, setFilter] = useState<"all" | "won" | "lost" | "pending">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const wonItems = useMemo(() => items.filter((i) => i.status === "won"), [items]);
  const lostItems = useMemo(() => items.filter((i) => i.status === "lost"), [items]);
  const pendingItems = useMemo(() => items.filter((i) => i.status === "pending"), [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by Tab Status
    if (filter === "won") result = result.filter((i) => i.status === "won");
    if (filter === "lost") result = result.filter((i) => i.status === "lost");
    if (filter === "pending") result = result.filter((i) => i.status === "pending");

    // Filter by Category
    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.studentChest.toLowerCase().includes(q) ||
          i.programName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, filter, categoryFilter, search]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: TeamResultItem[] } = {};
    filteredItems.forEach((item) => {
      const cat = item.category || "GENERAL";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <Card className="border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-800/90 p-5 md:p-6 rounded-3xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/20 p-2.5">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Team Results & Program Performance</h2>
                {onCloseLink && (
                  <Link href={onCloseLink}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                      ✕ Close
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Full breakdown of all registered programs, prize winners, and unplaced results
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
              filter === "all"
                ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md"
                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            All Results ({items.length})
          </button>

          <button
            onClick={() => setFilter("won")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border",
              filter === "won"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            )}
          >
            🏆 Won ({wonItems.length})
          </button>

          <button
            onClick={() => setFilter("lost")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border",
              filter === "lost"
                ? "bg-rose-500 text-white border-rose-400 font-extrabold shadow-md"
                : "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
            )}
          >
            ❌ Unplaced ({lostItems.length})
          </button>

          {pendingItems.length > 0 && (
            <button
              onClick={() => setFilter("pending")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border",
                filter === "pending"
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              )}
            >
              ⏳ Pending ({pendingItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search student or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <span className="text-xs text-white/40 font-medium shrink-0">Category:</span>
            <button
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap border",
                categoryFilter === "all"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-white/5 text-white/50 border-white/10 hover:text-white"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap border",
                  categoryFilter === cat
                    ? "bg-amber-500/30 text-amber-300 border-amber-500/50"
                    : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
          <Trophy className="mx-auto h-12 w-12 text-white/20 mb-2" />
          <p className="text-sm font-semibold text-white">No Programs Found</p>
          <p className="text-xs text-white/50 mt-1">
            {search
              ? `No program results match "${search}".`
              : filter === "won"
              ? "No prize-winning programs published yet for your team."
              : filter === "lost"
              ? "No unplaced programs."
              : "No program results found."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, catItems]) => (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2 px-1 border-l-2 border-amber-500/60 pl-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                  {category}
                </h3>
                <span className="text-[10px] text-white/40 font-mono">
                  ({catItems.length} {catItems.length === 1 ? 'program' : 'programs'})
                </span>
              </div>

              {/* Items in this category */}
              <div className="space-y-3">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3",
                      item.status === "won"
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                        : item.status === "lost"
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30"
                    )}
                  >
                    {/* Student & Program Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="text-2xl shrink-0 mt-0.5">
                        {item.position === 1
                          ? "🥇"
                          : item.position === 2
                          ? "🥈"
                          : item.position === 3
                          ? "🥉"
                          : item.status === "won"
                          ? "🏆"
                          : item.status === "lost"
                          ? "❌"
                          : "⏳"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.studentChest ? (
                            <Link
                              href={`/participant/${item.studentChest}`}
                              className="font-bold text-white text-base hover:text-cyan-300 hover:underline transition-colors"
                            >
                              {item.studentName}
                            </Link>
                          ) : (
                            <span className="font-bold text-white text-base">{item.studentName}</span>
                          )}

                          {item.studentChest && (
                            <span className="font-mono text-xs text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                              #{item.studentChest}
                            </span>
                          )}

                          {/* Status Badge */}
                          {item.status === "won" ? (
                            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase">
                              🏆 WON PRIZE
                            </span>
                          ) : item.status === "lost" ? (
                            <span className="text-[10px] font-semibold bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                              ❌ Unplaced
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                              ⏳ Result Pending
                            </span>
                          )}
                        </div>

                        {/* Program Details */}
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-white/70 flex-wrap">
                          <span className="font-semibold text-white/90 text-sm">{item.programName}</span>
                          <span>•</span>
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-amber-500/30">
                            Cat: {item.category}
                          </span>
                          <span className="bg-white/10 text-white/70 text-[10px] font-medium px-2 py-0.5 rounded uppercase">
                            {item.section}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Medals / Grades */}
                    <div className="flex items-center md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 border-white/10 pt-2 md:pt-0 shrink-0">
                      <div className="flex items-center gap-2">
                        {item.position && (
                          <span className="font-extrabold text-sm text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40">
                            {item.position === 1
                              ? "🥇 1st Place"
                              : item.position === 2
                              ? "🥈 2nd Place"
                              : "🥉 3rd Place"}
                          </span>
                        )}

                        {item.grade && (
                          <span className="font-bold text-xs text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                            Grade {item.grade}
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        <span className={cn(
                          "font-black text-lg",
                          item.score > 0 ? "text-emerald-400" : "text-white/40"
                        )}>
                          {item.score} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
