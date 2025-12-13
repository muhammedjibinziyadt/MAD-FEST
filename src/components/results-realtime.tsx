"use client";

import { useState } from "react";
import { ProgramsGrid } from "@/components/programs-grid";
import { SectionResults } from "@/components/section-results";
import { StudentLeaderboard } from "@/components/student-leaderboard";
import { useResultUpdates } from "@/hooks/use-realtime";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Program, ResultRecord, Student, Team } from "@/lib/types";

interface ResultsRealtimeProps {
  programs: Program[];
  results: ResultRecord[];
  programMap: Map<string, Program>;
  students: Student[];
  teams: Team[];
}

import { VerticalNavSidebar } from "@/components/vertical-nav-sidebar";

export function ResultsRealtime({
  programs: initialPrograms,
  results: initialResults,
  programMap: initialProgramMap,
  students,
  teams,
}: ResultsRealtimeProps) {
  const [activeTab, setActiveTab] = useState<"all" | "section" | "leaderboard">("all");
  const router = useRouter();

  const tabs = [
    { id: "all", label: "All Programs" },
    { id: "section", label: "Section Wise" },
    { id: "leaderboard", label: "Student Leaderboard" },
  ] as const;

  useResultUpdates(() => {
    router.refresh();
  });

  return (
    <div className="min-h-screen bg-[#fffcf5]">
      <VerticalNavSidebar />
      {/* Tab Navigation */}
      <div className="sticky top-0 z-50 bg-[#fffcf5]/80 backdrop-blur-md border-b border-[#8B4513]/10">
        <div className="container mx-auto px-4 pl-12 lg:pl-4">
          <div className="flex items-center justify-center gap-2 md:gap-4 py-4 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0
                  ${activeTab === tab.id
                    ? "text-[#8B4513] bg-[#8B4513]/10"
                    : "text-gray-500 hover:text-[#8B4513] hover:bg-[#8B4513]/5"
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-2xl border-2 border-[#8B4513]/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 pl-4 lg:pl-0">
        {activeTab === "all" && (
          <ProgramsGrid
            programs={initialPrograms}
            results={initialResults}
            programMap={initialProgramMap}
            students={students}
            teams={teams}
          />
        )}

        {activeTab === "section" && (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-[#8B4513] mb-2">Section Results</h2>
              <p className="text-gray-600">Filter results by section and category</p>
            </motion.div>
            <SectionResults
              programs={initialPrograms}
              results={initialResults}
              programMap={initialProgramMap}
              students={students}
              teams={teams}
            />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold text-[#8B4513] mb-2">Student Leaderboard</h2>
              <p className="text-gray-600">Top performers across all events</p>
            </motion.div>
            <StudentLeaderboard
              students={students}
              teams={teams}
            />
          </div>
        )}
      </div>
    </div>
  );
}










