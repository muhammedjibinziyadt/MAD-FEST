"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, AlertTriangle, Star, Tag } from "lucide-react";
import type { ParticipantProfile } from "@/lib/participant-service";
import { QRCodeDisplay } from "./qr-code-display";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticipantProfileProps {
  profile: ParticipantProfile;
}

const COLORS = {
  first: "#FFD700",
  second: "#C0C0C0",
  third: "#CD7F32",
  gradeA: "#10B981",
  gradeB: "#3B82F6",
  gradeC: "#F59E0B",
};

export function ParticipantProfileDisplay({ profile }: ParticipantProfileProps) {
  const { student, team, registrations, totalPoints, stats } = profile;
  const [programTab, setProgramTab] = useState<"all" | "won" | "lost" | "pending">("all");

  // Filter registrations into Won, Unplaced (Lost), and Pending
  const wonRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (!reg.result) return false;
      const hasPos = reg.result.position && reg.result.position >= 1 && reg.result.position <= 3;
      const hasGrade = reg.result.grade && reg.result.grade !== "none";
      const hasPoints = reg.result.score > 0;
      return hasPos || hasGrade || hasPoints;
    });
  }, [registrations]);

  const lostRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (reg.status !== "completed") return false;
      if (!reg.result) return true;
      const hasPos = reg.result.position && reg.result.position >= 1 && reg.result.position <= 3;
      const hasGrade = reg.result.grade && reg.result.grade !== "none";
      const hasPoints = reg.result.score > 0;
      return !hasPos && !hasGrade && !hasPoints;
    });
  }, [registrations]);

  const pendingRegistrations = useMemo(() => {
    return registrations.filter((reg) => reg.status === "registered" || reg.status === "pending_result");
  }, [registrations]);

  const displayedRegistrations = useMemo(() => {
    switch (programTab) {
      case "won":
        return wonRegistrations;
      case "lost":
        return lostRegistrations;
      case "pending":
        return pendingRegistrations;
      default:
        return registrations;
    }
  }, [programTab, registrations, wonRegistrations, lostRegistrations, pendingRegistrations]);

  // Chart data for points breakdown
  const pointsChartData = useMemo(() => {
    const bySection = registrations.reduce(
      (acc, reg) => {
        const section = reg.program.section;
        if (!acc[section]) {
          acc[section] = { name: section, points: 0, count: 0 };
        }
        acc[section].points += reg.result?.score || 0;
        acc[section].count += 1;
        return acc;
      },
      {} as Record<string, { name: string; points: number; count: number }>,
    );

    return Object.values(bySection).map((item) => ({
      ...item,
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    }));
  }, [registrations]);

  // Chart data for wins
  const winsData = useMemo(
    () => [
      { name: "1st Place", value: stats.wins.first, color: COLORS.first },
      { name: "2nd Place", value: stats.wins.second, color: COLORS.second },
      { name: "3rd Place", value: stats.wins.third, color: COLORS.third },
    ],
    [stats.wins],
  );

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-between items-center md:flex-row"
      >
        <div className="p-6 flex-1 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
              <AvatarFallback className="text-3xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: team.color }} title={team.name} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {student.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
            {student.chest_no} • {team.name}
          </p>

          {/* Student Category Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border border-amber-200 dark:border-amber-800 shadow-sm">
              <Tag className="w-3.5 h-3.5" />
              Category: {student.category || "GENERAL"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Points</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalPoints}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Items</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalPrograms}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Wins</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.wins.first + stats.wins.second + stats.wins.third}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4 pb-6 md:pb-0 md:pr-6">
          <QRCodeDisplay chestNumber={student.chest_no} participantName={student.name} />
        </div>
      </motion.div>
      

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points Chart */}
        <Card className="p-5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
          <CardTitle className="mb-4 text-base text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart className="w-4 h-4 text-gray-400" />
            Points Analysis
          </CardTitle>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="points" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Wins Chart */}
        <Card className="p-5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
          <CardTitle className="mb-4 text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            Victory Stats
          </CardTitle>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.wins.first + stats.wins.second + stats.wins.third}
                </span>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Wins</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Programs Section with Won / Lost / Pending Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Program Results & History
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            <button
              onClick={() => setProgramTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                programTab === "all"
                  ? "bg-[#8B4513] text-white border-[#8B4513]"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-amber-50"
              )}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setProgramTab("won")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border",
                programTab === "won"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50"
              )}
            >
              🏆 Won ({wonRegistrations.length})
            </button>
            <button
              onClick={() => setProgramTab("lost")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border",
                programTab === "lost"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
              )}
            >
              ❌ Unplaced ({lostRegistrations.length})
            </button>
            {pendingRegistrations.length > 0 && (
              <button
                onClick={() => setProgramTab("pending")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 border",
                  programTab === "pending"
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 hover:bg-amber-50"
                )}
              >
                ⏳ Pending ({pendingRegistrations.length})
              </button>
            )}
          </div>
        </div>

        {displayedRegistrations.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {programTab === "won" && "No prize-winning programs yet."}
              {programTab === "lost" && "No unplaced programs."}
              {programTab === "pending" && "No pending program results."}
              {programTab === "all" && "No program registrations found."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayedRegistrations.map((reg, index) => {
              const isWon = reg.result && (
                (reg.result.position && reg.result.position >= 1 && reg.result.position <= 3) ||
                (reg.result.grade && reg.result.grade !== "none") ||
                reg.result.score > 0
              );
              const isLost = reg.status === "completed" && !isWon;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={reg.id}
                >
                  <Card className={cn(
                    "p-4 bg-white dark:bg-gray-900 border shadow-sm rounded-2xl transition-all",
                    isWon ? "border-emerald-300 dark:border-emerald-900/50 bg-emerald-50/30" :
                    isLost ? "border-gray-200 dark:border-gray-800 bg-gray-50/30" :
                    "border-amber-200 dark:border-amber-900/50"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {reg.program.name}
                        </h3>
                      </div>
                      
                      {/* Status / Victory Badge */}
                      {isWon ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          🏆 WON PRIZE
                        </span>
                      ) : isLost ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-0.5 rounded-full border border-gray-200">
                          ❌ Unplaced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200">
                          ⏳ Result Pending
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md font-medium">
                        Section: {reg.program.section}
                      </span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold uppercase">
                        Category: {reg.program.category || student.category || "GENERAL"}
                      </span>
                    </div>

                    {reg.result ? (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          {reg.result.position ? (
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900/40">
                              <Trophy className={`w-4 h-4 ${
                                reg.result.position === 1 ? 'text-yellow-500' :
                                reg.result.position === 2 ? 'text-gray-400' : 'text-amber-600'
                              }`} />
                              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                                {reg.result.position === 1 ? '🥇 1st Place' : reg.result.position === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">No Position</span>
                          )}

                          {reg.result.grade && reg.result.grade !== "none" && (
                            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">Grade {reg.result.grade}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-black text-base text-purple-600 dark:text-purple-400">{reg.result.score} pts</span>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                        <span className="italic">
                          {reg.status === "completed" ? "No placement" : "Result not yet published"}
                        </span>
                        <span className="font-bold">0 pts</span>
                      </div>
                    )}

                    {reg.penalty && (
                      <div className="mt-2 text-[10px] text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        <span>-{reg.penalty.points}: {reg.penalty.reason}</span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
