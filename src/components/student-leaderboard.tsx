"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Search, Crown, ChevronRight } from "lucide-react";
import type { Student, Team } from "@/lib/types";
import Image from "next/image";

interface StudentLeaderboardProps {
    students: Student[];
    teams: Team[];
}

export function StudentLeaderboard({ students, teams }: StudentLeaderboardProps) {
    const [search, setSearch] = useState("");

    const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

    const sortedStudents = useMemo(() => {
        return [...students]
            .filter((s) => s.total_points > 0)
            .sort((a, b) => b.total_points - a.total_points)
            .map((student, index) => ({
                ...student,
                rank: index + 1,
                teamName: teamMap.get(student.team_id)?.name || "Unknown Team",
                teamColor: teamMap.get(student.team_id)?.color || "#808080",
            }));
    }, [students, teamMap]);

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return sortedStudents;
        const normalized = search.toLowerCase();
        return sortedStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(normalized) ||
                s.chest_no.toLowerCase().includes(normalized) ||
                s.teamName.toLowerCase().includes(normalized)
        );
    }, [search, sortedStudents]);

    const topStudents = sortedStudents.slice(0, 3);
    const restStudents = filteredStudents.filter(s => s.rank > 3 || search); // If search is active, show all matches in list

    return (
        <div className="space-y-8 md:space-y-12 pt-4 md:pt-8 w-full">
            {/* Search Bar - Floating & Elegant */}
            <div className="relative max-w-lg mx-auto px-4 z-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#8B4513] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search student, chest no..."
                        className="block w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-xs text-gray-400 border border-gray-100 px-2 py-0.5 rounded-md hidden md:block">
                            {filteredStudents.length} students
                        </span>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium - Only show if no search filter */}
            {!search && topStudents.length > 0 && (
                <div className="relative mt-8 mb-12 px-4">
                    {/* Podium Container */}
                    <div className="flex items-end justify-center gap-2 md:gap-8 min-h-[220px] md:min-h-[280px]">

                        {/* 2nd Place */}
                        {topStudents[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center w-1/3 max-w-[140px]"
                            >
                                <div className="relative mb-2 md:mb-4">
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-gray-300 shadow-xl overflow-hidden relative z-10 bg-white">
                                        {topStudents[1].avatar ? (
                                            <Image
                                                src={topStudents[1].avatar}
                                                alt={topStudents[1].name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-bold text-gray-400">
                                                {topStudents[1].name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap">
                                        2ND PLACE
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-lg truncate px-1">{topStudents[1].name}</h3>
                                    <p className="text-xs text-gray-500 mb-1 truncate">{topStudents[1].teamName}</p>
                                    <div className="inline-block bg-white border border-gray-200 shadow-sm rounded-lg px-2 md:px-3 py-1">
                                        <span className="font-bold text-[#8B4513] text-sm md:text-base">{topStudents[1].total_points}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place - Center & Higher */}
                        {topStudents[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center w-1/3 max-w-[160px] -mt-10 md:-mt-16 z-20"
                            >
                                <div className="relative mb-2 md:mb-4">
                                    <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 animate-bounce">
                                        <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
                                    </div>
                                    <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden relative z-10 ring-4 ring-yellow-400/20 bg-white">
                                        {topStudents[0].avatar ? (
                                            <Image
                                                src={topStudents[0].avatar}
                                                alt={topStudents[0].name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-3xl font-bold text-gray-400">
                                                {topStudents[0].name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 rounded-full shadow-lg z-20 whitespace-nowrap flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> CHAMPION
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-900 text-base md:text-xl truncate px-1">{topStudents[0].name}</h3>
                                    <p className="text-xs text-gray-500 mb-1 truncate">{topStudents[0].teamName}</p>
                                    <div className="inline-block bg-yellow-50 border border-yellow-200 shadow-sm rounded-lg px-3 md:px-4 py-1">
                                        <span className="font-black text-yellow-700 text-base md:text-lg">{topStudents[0].total_points}</span>
                                        <span className="text-[10px] text-yellow-600/70 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {topStudents[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center w-1/3 max-w-[140px]"
                            >
                                <div className="relative mb-2 md:mb-4">
                                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-orange-300 shadow-xl overflow-hidden relative z-10 bg-white">
                                        {topStudents[2].avatar ? (
                                            <Image
                                                src={topStudents[2].avatar}
                                                alt={topStudents[2].name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-bold text-gray-400">
                                                {topStudents[2].name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap">
                                        3RD PLACE
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-lg truncate px-1">{topStudents[2].name}</h3>
                                    <p className="text-xs text-gray-500 mb-1 truncate">{topStudents[2].teamName}</p>
                                    <div className="inline-block bg-white border border-gray-200 shadow-sm rounded-lg px-2 md:px-3 py-1">
                                        <span className="font-bold text-[#8B4513] text-sm md:text-base">{topStudents[2].total_points}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* List View - Card Style for Mobile */}
            <div className="px-4 pb-20">
                <div className="max-w-4xl mx-auto space-y-3">
                    {search.length > 0 || restStudents.length > 0 ? (
                        <AnimatePresence>
                            {(search ? filteredStudents : restStudents).map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 overflow-hidden"
                                >
                                    {/* Rank Badge */}
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold
                                        ${student.rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50/50' :
                                            student.rank === 2 ? 'bg-gray-100 text-gray-700 ring-4 ring-gray-50/50' :
                                                student.rank === 3 ? 'bg-orange-100 text-orange-700 ring-4 ring-orange-50/50' :
                                                    'bg-gray-50 text-gray-500'}
                                    `}>
                                        {student.rank}
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                                            {student.avatar ? (
                                                <Image
                                                    src={student.avatar}
                                                    alt={student.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                    {student.name[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-grow min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base truncate group-hover:text-[#8B4513] transition-colors">
                                            {student.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 rounded">{student.chest_no}</span>
                                            <span className="text-[10px] md:text-xs text-gray-500 truncate border-l border-gray-200 pl-2">
                                                {student.teamName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="flex-shrink-0 text-right pl-2">
                                        <div className="font-black text-gray-900 text-base md:text-xl">
                                            {student.total_points}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Points</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                            No students found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
