"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Program, ResultRecord, Student, Team } from "@/lib/types";
import { ResultProgramCard } from "./result-program-card";
import { Filter } from "lucide-react";
import { StudentLeaderboard } from "./student-leaderboard";
import { TeamLeaderboard } from "./team-leaderboard";

interface SectionResultsProps {
    programs: Program[];
    results: ResultRecord[];
    programMap: Map<string, Program>;
    students: Student[];
    teams: Team[];
}

type FilterType = "stage" | "non-stage" | "group" | "general";

export function SectionResults({ programs, results, programMap, students, teams }: SectionResultsProps) {
    const [filter, setFilter] = useState<FilterType>("stage");

    const resultMap = useMemo(() => new Map(results.map((r) => [r.program_id, r])), [results]);

    const filteredPrograms = useMemo(() => {
        // Only show programs that have results
        const programsWithResults = programs.filter(p => resultMap.has(p.id));

        return programsWithResults.filter((program) => {
            switch (filter) {
                case "stage":
                    return program.stage === true;
                case "non-stage":
                    return program.stage === false;
                case "group":
                    return program.section === "group";
                case "general":
                    return program.section === "general";
                default:
                    return true;
            }
        });
    }, [programs, resultMap, filter]);

    // Calculate specific points based on current filter results
    const leaderboardData = useMemo(() => {
        const relevantProgramIds = new Set(filteredPrograms.map(p => p.id));
        const relevantResults = results.filter(r => relevantProgramIds.has(r.program_id));

        if (filter === "stage" || filter === "non-stage") {
            // Calculate Student Points for this section
            const studentPoints = new Map<string, number>();

            relevantResults.forEach(result => {
                result.entries.forEach(entry => {
                    if (entry.student_id) {
                        const current = studentPoints.get(entry.student_id) || 0;
                        studentPoints.set(entry.student_id, current + entry.score);
                    }
                });
            });

            // Return students with updated points
            const updatedStudents = students.map(s => ({
                ...s,
                total_points: studentPoints.get(s.id) || 0
            })).filter(s => s.total_points > 0); // Only show students with points in this section

            return { type: "student", data: updatedStudents };
        } else {
            // Calculate Team Points for this section
            const teamPoints = new Map<string, number>();

            relevantResults.forEach(result => {
                // Some results might be directly assigned to teams (group items)
                // or aggregated from students (if needed, but usually group items have entries with team_id)

                result.entries.forEach(entry => {
                    if (entry.team_id) {
                        const current = teamPoints.get(entry.team_id) || 0;
                        teamPoints.set(entry.team_id, current + entry.score);
                    } else if (entry.student_id) {
                        // If entry is student-based, find their team and add points
                        const student = students.find(s => s.id === entry.student_id);
                        if (student?.team_id) {
                            const current = teamPoints.get(student.team_id) || 0;
                            teamPoints.set(student.team_id, current + entry.score);
                        }
                    }
                });
            });

            const updatedTeams = teams.map(t => ({
                ...t,
                total_points: teamPoints.get(t.id) || 0
            })).filter(t => t.total_points > 0);

            return { type: "team", data: updatedTeams };
        }
    }, [filteredPrograms, results, students, teams, filter]);

    const getProgramStats = (programId: string) => {
        const program = programMap.get(programId);
        return {
            hasResults: true, // We only show programs with results here
            section: program?.section || "general",
            category: program?.category || "none",
        };
    };

    const filters: { id: FilterType; label: string }[] = [
        { id: "stage", label: "Stage Items" },
        { id: "non-stage", label: "Non-Stage" },
        { id: "group", label: "Group Items" },
        { id: "general", label: "General" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div className="space-y-12">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`
              px-6 py-2.5 rounded-full font-medium transition-all duration-300 relative
              ${filter === f.id
                                ? "bg-[#8B4513] text-white shadow-lg shadow-[#8B4513]/20 scale-105"
                                : "bg-white text-gray-600 hover:bg-[#8B4513]/5 hover:text-[#8B4513]"
                            }
            `}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Section Leaderboard */}
            <motion.div
                key={filter} // Re-animate on filter change
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {filter.charAt(0).toUpperCase() + filter.slice(1)} Leaderboard
                    </h3>
                    <p className="text-gray-500">Top performers in {filter.replace("-", " ")} items</p>
                </div>

                {leaderboardData.type === "student" ? (
                    <StudentLeaderboard
                        students={leaderboardData.data as Student[]}
                        teams={teams}
                    />
                ) : (
                    <TeamLeaderboard
                        teams={leaderboardData.data as Team[]}
                    />
                )}
            </motion.div>

            {/* Results Grid */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 ml-4 border-l-4 border-[#8B4513] pl-3">
                    {filter.charAt(0).toUpperCase() + filter.slice(1)} Programs
                </h3>

                {filteredPrograms.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredPrograms.map((program, index) => {
                            const stats = getProgramStats(program.id);
                            const result = resultMap.get(program.id);
                            return (
                                <ResultProgramCard
                                    key={program.id}
                                    program={program}
                                    result={result}
                                    stats={stats}
                                    index={index}
                                />
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <Filter className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700">
                                No results found
                            </h3>
                            <p className="text-gray-500">
                                No published results for {filter} items yet.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
