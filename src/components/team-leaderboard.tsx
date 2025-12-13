"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="space-y-8">
            {/* Top 3 Podium */}
            {topTeams.length > 0 && !search && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end"
                >
                    {/* Second Place */}
                    {topTeams[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-gray-300"
                                    style={{ backgroundColor: topTeams[1].color }}
                                >
                                    {topTeams[1].name[0]}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    2ND
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-center leading-tight">{topTeams[1].name}</h3>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-bold text-[#8B4513] mt-2">
                                {topTeams[1].total_points} PTS
                            </div>
                        </div>
                    )}

                    {/* First Place */}
                    {topTeams[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center z-10 scale-110">
                            <div className="relative mb-4">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                    <Crown className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-bounce" />
                                </div>
                                <div
                                    className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-yellow-500 ring-4 ring-yellow-500/20"
                                    style={{ backgroundColor: topTeams[0].color }}
                                >
                                    {topTeams[0].name[0]}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    1ST
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-center leading-tight">{topTeams[0].name}</h3>
                            <div className="bg-yellow-50 px-6 py-2 rounded-full shadow-md border border-yellow-200 font-bold text-yellow-700 text-lg mt-2">
                                {topTeams[0].total_points} PTS
                            </div>
                        </div>
                    )}

                    {/* Third Place */}
                    {topTeams[2] && (
                        <div className="order-3 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div
                                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-orange-300"
                                    style={{ backgroundColor: topTeams[2].color }}
                                >
                                    {topTeams[2].name[0]}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    3RD
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-center leading-tight">{topTeams[2].name}</h3>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-bold text-[#8B4513] mt-2">
                                {topTeams[2].total_points} PTS
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Team</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-gray-50"
                        >
                            {filteredTeams.map((team) => (
                                <motion.tr
                                    key={team.id}
                                    variants={item}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${team.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                team.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                    team.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-50 text-gray-500'}
                    `}>
                                            {team.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: team.color }}
                                            >
                                                {team.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-[#8B4513] transition-colors">
                                                    {team.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="font-bold text-gray-900 text-lg">{team.total_points}</span>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
