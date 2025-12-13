"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Search, Crown } from "lucide-react";
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

    // Animation variants
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
            {topStudents.length > 0 && !search && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end"
                >
                    {/* Second Place */}
                    {topStudents[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 shadow-xl">
                                    {topStudents[1].avatar ? (
                                        <Image
                                            src={topStudents[1].avatar}
                                            alt={topStudents[1].name}
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                            {topStudents[1].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    2ND
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-center leading-tight">{topStudents[1].name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{topStudents[1].teamName}</p>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-bold text-[#8B4513]">
                                {topStudents[1].total_points} PTS
                            </div>
                        </div>
                    )}

                    {/* First Place */}
                    {topStudents[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center z-10 scale-110">
                            <div className="relative mb-4">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                    <Crown className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-bounce" />
                                </div>
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-yellow-500 shadow-2xl ring-4 ring-yellow-500/20">
                                    {topStudents[0].avatar ? (
                                        <Image
                                            src={topStudents[0].avatar}
                                            alt={topStudents[0].name}
                                            width={112}
                                            height={112}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                                            {topStudents[0].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    1ST
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-center leading-tight">{topStudents[0].name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{topStudents[0].teamName}</p>
                            <div className="bg-yellow-50 px-6 py-2 rounded-full shadow-md border border-yellow-200 font-bold text-yellow-700 text-lg">
                                {topStudents[0].total_points} PTS
                            </div>
                        </div>
                    )}

                    {/* Third Place */}
                    {topStudents[2] && (
                        <div className="order-3 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-300 shadow-xl">
                                    {topStudents[2].avatar ? (
                                        <Image
                                            src={topStudents[2].avatar}
                                            alt={topStudents[2].name}
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                            {topStudents[2].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    3RD
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-center leading-tight">{topStudents[2].name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{topStudents[2].teamName}</p>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-bold text-[#8B4513]">
                                {topStudents[2].total_points} PTS
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students, chest no..."
                    className="w-full bg-white border border-gray-200 h-12 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Team</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-gray-50"
                        >
                            {filteredStudents.map((student) => (
                                <motion.tr
                                    key={student.id}
                                    variants={item}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                student.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                    student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-50 text-gray-500'}
                    `}>
                                            {student.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                {student.avatar ? (
                                                    <Image
                                                        src={student.avatar}
                                                        alt={student.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                                        {student.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-[#8B4513] transition-colors">
                                                    {student.name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    {student.chest_no}
                                                </div>
                                                <div className="md:hidden text-xs text-gray-400 mt-0.5">
                                                    {student.teamName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: `${student.teamColor}15`,
                                                color: student.teamColor
                                            }}
                                        >
                                            {student.teamName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="font-bold text-gray-900 text-lg">{student.total_points}</span>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
                {filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No students found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
