"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Crown, Trophy } from "lucide-react";
import type { Team } from "@/lib/types";

interface TeamLeaderboardProps {
    teams: Team[];
}

export function TeamLeaderboard({ teams }: TeamLeaderboardProps) {
    const [search, setSearch] = useState("");

    const sortedTeams = useMemo(() => {
        return [...teams]
            .sort((a, b) => b.total_points - a.total_points)
            .map((team, index) => ({
                ...team,
                rank: index + 1,
            }));
    }, [teams]);

    const filteredTeams = useMemo(() => {
        if (!search.trim()) return sortedTeams;
        const normalized = search.toLowerCase();
        return sortedTeams.filter((t) => t.name.toLowerCase().includes(normalized));
    }, [search, sortedTeams]);

    const topTeams = sortedTeams.slice(0, 3);
    const restTeams = filteredTeams.filter(t => t.rank > 3 || search);

    return (
        <div className="space-y-8 md:space-y-12 w-full">
            {/* Top 3 Podium */}
            {topTeams.length > 0 && !search && (
                <div className="relative mt-8 mb-12 px-4">
                    <div className="flex items-start justify-center gap-2 md:gap-8 pt-14 pb-8">

                        {/* 2nd Place */}
                        {topTeams[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center w-1/3 max-w-[140px] mt-8 md:mt-12"
                            >
                                <div className="relative mb-6 md:mb-8">
                                    <div
                                        className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-xl border-4 border-gray-300 relative z-10"
                                        style={{ backgroundColor: topTeams[1].color }}
                                    >
                                        {topTeams[1].name[0]}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap">
                                        2ND PLACE
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-lg px-1 text-center leading-tight mb-1">{topTeams[1].name}</h3>
                                    <div className="inline-block bg-white border border-gray-200 shadow-sm rounded-lg px-2 md:px-3 py-1">
                                        <span className="font-bold text-[#8B4513] text-sm md:text-base">{topTeams[1].total_points}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {topTeams[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center w-1/3 max-w-[160px] z-20"
                            >
                                <div className="relative mb-6 md:mb-8">
                                    <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 animate-bounce">
                                        <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
                                    </div>
                                    <div
                                        className="w-24 h-24 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl md:text-6xl font-bold text-white shadow-2xl border-4 border-yellow-400 ring-4 ring-yellow-400/20 relative z-10"
                                        style={{ backgroundColor: topTeams[0].color }}
                                    >
                                        {topTeams[0].name[0]}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 rounded-full shadow-lg z-20 whitespace-nowrap flex items-center gap-1">
                                        <Trophy className="w-3 h-3" /> CHAMPION
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-xl px-1 text-center leading-tight mb-1">{topTeams[0].name}</h3>
                                    <div className="inline-block bg-yellow-50 border border-yellow-200 shadow-sm rounded-lg px-3 md:px-4 py-1">
                                        <span className="font-black text-yellow-700 text-base md:text-lg">{topTeams[0].total_points}</span>
                                        <span className="text-[10px] text-yellow-600/70 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Third Place */}
                        {topTeams[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center w-1/3 max-w-[140px] mt-8 md:mt-12"
                            >
                                <div className="relative mb-6 md:mb-8">
                                    <div
                                        className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-xl border-4 border-orange-300 relative z-10"
                                        style={{ backgroundColor: topTeams[2].color }}
                                    >
                                        {topTeams[2].name[0]}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap">
                                        3RD PLACE
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-lg px-1 text-center leading-tight mb-1">{topTeams[2].name}</h3>
                                    <div className="inline-block bg-white border border-gray-200 shadow-sm rounded-lg px-2 md:px-3 py-1">
                                        <span className="font-bold text-[#8B4513] text-sm md:text-base">{topTeams[2].total_points}</span>
                                        <span className="text-[10px] text-gray-400 ml-1">PTS</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* List View - Card Style for Mobile */}
            <div className="px-4 pb-4">
                <div className="max-w-4xl mx-auto space-y-3">
                    <AnimatePresence>
                        {(search ? filteredTeams : restTeams).map((team, index) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 overflow-hidden"
                            >
                                {/* Rank Badge */}
                                <div className={`
                                    flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold
                                    ${team.rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50/50' :
                                        team.rank === 2 ? 'bg-gray-100 text-gray-700 ring-4 ring-gray-50/50' :
                                            team.rank === 3 ? 'bg-orange-100 text-orange-700 ring-4 ring-orange-50/50' :
                                                'bg-gray-50 text-gray-500'}
                                `}>
                                    {team.rank}
                                </div>

                                {/* Team Avatar */}
                                <div
                                    className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-lg"
                                    style={{ backgroundColor: team.color }}
                                >
                                    {team.name[0]}
                                </div>

                                {/* Details */}
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-[#8B4513] transition-colors leading-tight">
                                        {team.name}
                                    </h4>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        Team ID: {team.id}
                                    </div>
                                </div>

                                {/* Points */}
                                <div className="flex-shrink-0 text-right pl-2">
                                    <div className="font-black text-gray-900 text-base md:text-xl">
                                        {team.total_points}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Points</div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
