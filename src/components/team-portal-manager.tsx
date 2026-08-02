"use client";

import React, { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { Search, Users, UserCheck, FileText, Trash2, Pencil, Eye, TrendingUp, LayoutGrid, Filter, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import { Modal } from "@/components/ui/modal";
import { ColorSelectorInput } from "@/components/ui/color-selector-input";
import { useDebounce } from "@/hooks/use-debounce";
import type { PortalTeam } from "@/lib/types";
import { ReportPrintModal, type ReportConfig } from "@/components/ui/report-print-modal";

interface PortalStudent {
  id: string;
  name: string;
  chestNumber: string;
  teamId: string;
}

interface ProgramRegistration {
  id: string;
  teamId: string;
  teamName?: string;
  programName: string;
  studentName: string;
  studentChest: string;
}

interface TeamPortalManagerProps {
  teams: PortalTeam[];
  students: PortalStudent[];
  registrations: ProgramRegistration[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

// Submit button component that uses form status
function SubmitButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending} onClick={onClick}>
      {children}
    </Button>
  );
}

// Delete button component that uses form status
function DeleteButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" className="flex-1" loading={pending}>
      {children}
    </Button>
  );
}

export const TeamPortalManager = React.memo(function TeamPortalManager({
  teams,
  students,
  registrations,
  updateAction,
  deleteAction,
}: TeamPortalManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [activeView, setActiveView] = useState<"teams" | "students" | "registrations" | null>(null);
  const [editingTeam, setEditingTeam] = useState<PortalTeam | null>(null);
  const [viewingTeam, setViewingTeam] = useState<PortalTeam | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [registrationGroupBy, setRegistrationGroupBy] = useState<"all" | "program" | "team">("all");
  const [registrationTeamFilter, setRegistrationTeamFilter] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleUpdateTeam = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateAction(formData);
        setEditingTeam(null);
      } catch (error) {
        console.error("Failed to update team:", error);
      }
    });
  };

  const handleDeleteTeam = (formData: FormData) => {
    startTransition(async () => {
      try {
        await deleteAction(formData);
        setDeleteConfirm(null);
      } catch (error) {
        console.error("Failed to delete team:", error);
      }
    });
  };

  const filteredTeams = useMemo(() => {
    if (!activeView || activeView !== "teams") return [];
    return teams.filter((team) =>
      team.teamName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      team.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [teams, debouncedSearchQuery, activeView]);

  const [activeReportConfig, setActiveReportConfig] = useState<ReportConfig | null>(null);

  const teamReportConfig = useMemo(() => ({
    title: "TEAMS LIST REPORT",
    subtitle: "Registered Madrasa Fest Teams",
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Team Name", render: (t: PortalTeam) => t.teamName, align: "left" as const },
      { header: "Leader Name", render: (t: PortalTeam) => t.leaderName || "N/A", align: "left" as const },
      { header: "Gender / Type", render: (t: PortalTeam) => (t.gender || "mixed").toUpperCase(), align: "center" as const, width: "120px" },
      { header: "Students", render: (t: PortalTeam) => students.filter((s) => s.teamId === t.id).length, align: "center" as const, width: "90px" },
    ],
    data: teams,
    filename: "teams_list_report",
  }), [teams, students]);



  const filteredStudents = useMemo(() => {
    if (!activeView || activeView !== "students") return [];
    return students.filter((student) =>
      student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      student.chestNumber.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      student.teamId.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [students, debouncedSearchQuery, activeView]);

  const registrationStats = useMemo(() => {
    const uniquePrograms = new Set(registrations.map((r) => r.programName));
    const uniqueTeams = new Set(registrations.map((r) => r.teamId));
    const programCounts = registrations.reduce<Record<string, number>>((acc, reg) => {
      acc[reg.programName] = (acc[reg.programName] || 0) + 1;
      return acc;
    }, {});
    const teamCounts = registrations.reduce<Record<string, number>>((acc, reg) => {
      acc[reg.teamId] = (acc[reg.teamId] || 0) + 1;
      return acc;
    }, {});
    const topPrograms = Object.entries(programCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const topTeams = Object.entries(teamCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    return {
      total: registrations.length,
      uniquePrograms: uniquePrograms.size,
      uniqueTeams: uniqueTeams.size,
      programCounts,
      teamCounts,
      topPrograms,
      topTeams,
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    if (!activeView || activeView !== "registrations") return [];
    let filtered = registrations.filter((reg) =>
      reg.programName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      reg.studentName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      reg.studentChest.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      reg.teamId.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (reg.teamName && reg.teamName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );

    if (registrationTeamFilter) {
      filtered = filtered.filter((reg) => reg.teamId === registrationTeamFilter);
    }

    return filtered;
  }, [registrations, debouncedSearchQuery, activeView, registrationTeamFilter]);

  const studentsReportConfig = useMemo(() => ({
    title: "STUDENTS ROSTER REPORT",
    subtitle: "All Registered Team Members",
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Students name", render: (s: PortalStudent) => s.name, align: "left" as const },
      { header: "Chest number", render: (s: PortalStudent) => s.chestNumber, align: "center" as const, width: "130px" },
      { header: "Team Name", render: (s: PortalStudent) => teams.find((t) => t.id === s.teamId)?.teamName || s.teamId, align: "left" as const },
    ],
    data: filteredStudents.length > 0 ? filteredStudents : students,
    filename: "students_roster_report",
  }), [students, filteredStudents, teams]);

  const registrationsReportConfig = useMemo(() => ({
    title: "PROGRAM REGISTRATIONS REPORT",
    subtitle: "Madrasa Fest Event Registrations",
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Student Name", render: (r: ProgramRegistration) => r.studentName, align: "left" as const },
      { header: "Chest", render: (r: ProgramRegistration) => r.studentChest, align: "center" as const, width: "100px" },
      { header: "Program Name", render: (r: ProgramRegistration) => r.programName, align: "left" as const },
      { header: "Team Name", render: (r: ProgramRegistration) => r.teamName || r.teamId, align: "left" as const },
    ],
    data: filteredRegistrations.length > 0 ? filteredRegistrations : registrations,
    filename: "program_registrations_report",
  }), [registrations, filteredRegistrations]);

  const groupedRegistrations = useMemo(() => {
    if (registrationGroupBy === "program") {
      const grouped = filteredRegistrations.reduce<Record<string, ProgramRegistration[]>>(
        (acc, reg) => {
          if (!acc[reg.programName]) {
            acc[reg.programName] = [];
          }
          acc[reg.programName].push(reg);
          return acc;
        },
        {}
      );
      return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
    } else if (registrationGroupBy === "team") {
      const grouped = filteredRegistrations.reduce<Record<string, ProgramRegistration[]>>(
        (acc, reg) => {
          const teamKey = reg.teamName || reg.teamId;
          if (!acc[teamKey]) {
            acc[teamKey] = [];
          }
          acc[teamKey].push(reg);
          return acc;
        },
        {}
      );
      return Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);
    }
    return [];
  }, [filteredRegistrations, registrationGroupBy]);

  const teamOptions = useMemo(() => {
    const uniqueTeams = Array.from(
      new Set(registrations.map((r) => ({ id: r.teamId, name: teams.find(t => t.id === r.teamId)?.teamName || r.teamId })))
    );
    return [{ value: "", label: "All Teams" }, ...uniqueTeams.map((t) => ({ value: t.id, label: t.name }))];
  }, [registrations, teams]);

  const getTeamStats = (teamId: string) => {
    const teamStudents = students.filter((s) => s.teamId === teamId);
    const teamRegistrations = registrations.filter((r) => r.teamId === teamId);
    return {
      studentCount: teamStudents.length,
      registrationCount: teamRegistrations.length,
    };
  };

  const closeView = () => {
    setActiveView(null);
    setSearchQuery("");
    setRegistrationGroupBy("all");
    setRegistrationTeamFilter("");
  };

  return (
    <>
      <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(8,47,73,0.35)]">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">Manage Portal</p>
          <h2 className="text-2xl font-semibold text-white">Teams & Activity</h2>
          <p className="text-sm text-white/60 mt-1">
            View and manage teams, students, and registrations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Button
            type="button"
            variant="secondary"
            className="h-auto flex-col items-start gap-2 p-6 text-left"
            onClick={() => setActiveView("teams")}
          >
            <Users className="h-6 w-6 text-fuchsia-400" />
            <div>
              <div className="font-semibold text-white">View Teams</div>
              <div className="text-xs text-white/60 mt-1">
                {teams.length} team{teams.length !== 1 ? "s" : ""} registered
              </div>
            </div>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-auto flex-col items-start gap-2 p-6 text-left"
            onClick={() => setActiveView("students")}
          >
            <UserCheck className="h-6 w-6 text-cyan-400" />
            <div>
              <div className="font-semibold text-white">View Students</div>
              <div className="text-xs text-white/60 mt-1">
                {students.length} student{students.length !== 1 ? "s" : ""} registered
              </div>
            </div>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-auto flex-col items-start gap-2 p-6 text-left"
            onClick={() => setActiveView("registrations")}
          >
            <FileText className="h-6 w-6 text-rose-400" />
            <div>
              <div className="font-semibold text-white">View Registrations</div>
              <div className="text-xs text-white/60 mt-1">
                {registrations.length} registration{registrations.length !== 1 ? "s" : ""}
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Teams View Modal */}
      <Modal
        open={activeView === "teams"}
        onClose={closeView}
        title="Teams"
        size="xl"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setActiveReportConfig(teamReportConfig)}
              className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg"
            >
              <Printer className="h-4 w-4" /> Download / Print Report
            </Button>
            <Button variant="secondary" onClick={closeView}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition-all duration-200 focus-within:border-fuchsia-400/50 focus-within:ring-2 focus-within:ring-fuchsia-400/30">
            <Search className="mr-2 h-4 w-4 text-white/50 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>

          <div className="max-h-[350px] space-y-3 overflow-y-auto">
            {filteredTeams.length === 0 ? (
              <p className="text-center text-sm text-white/60 py-8">
                {searchQuery ? "No teams found" : "No teams available"}
              </p>
            ) : (
              filteredTeams.map((team) => {
                const stats = getTeamStats(team.id);
                return (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-white/50">ID: {team.id}</p>
                        <h3 className="font-semibold text-white mt-1 flex items-center gap-2">
                          {team.teamName}
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            team.gender === "boys" ? "bg-sky-500/10 border-sky-500/30 text-sky-400" :
                            team.gender === "girls" ? "bg-pink-500/10 border-pink-500/30 text-pink-400" :
                            "bg-purple-500/10 border-purple-500/30 text-purple-400"
                          }`}>
                            {team.gender === "boys" ? "Boys" : team.gender === "girls" ? "Girls" : "Mixed"}
                          </span>
                        </h3>
                        <p className="text-sm text-white/70 mt-1">Leader: {team.leaderName}</p>
                        <div className="flex gap-4 mt-2 text-xs text-white/60">
                          <span>Students: {stats.studentCount}</span>
                          <span>Registrations: {stats.registrationCount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTeam(team)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTeam(team)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(team.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Students View Modal */}
      <Modal
        open={activeView === "students"}
        onClose={closeView}
        title="Students"
        size="xl"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setActiveReportConfig(studentsReportConfig)}
              className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg"
            >
              <Printer className="h-4 w-4" /> Download / Print Report
            </Button>
            <Button variant="secondary" onClick={closeView}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition-all duration-200 focus-within:border-fuchsia-400/50 focus-within:ring-2 focus-within:ring-fuchsia-400/30">
            <Search className="mr-2 h-4 w-4 text-white/50 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>

          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-sm text-white/60 py-8">
                {searchQuery ? "No students found" : "No students available"}
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{student.name}</p>
                      <p className="text-xs text-white/60 mt-1">
                        Chest: {student.chestNumber} · Team: {student.teamId}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Registrations View Modal */}
      <Modal
        open={activeView === "registrations"}
        onClose={closeView}
        title="Program Registrations Analytics"
        size="xl"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setActiveReportConfig(registrationsReportConfig)}
              className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg"
            >
              <Printer className="h-4 w-4" /> Download / Print Report
            </Button>
            <Button variant="secondary" onClick={closeView}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <FileText className="h-4 w-4" />
                <p className="text-xs">Total</p>
              </div>
              <p className="text-2xl font-bold text-white">{registrationStats.total}</p>
              <p className="text-xs text-white/50 mt-1">Registrations</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <LayoutGrid className="h-4 w-4" />
                <p className="text-xs">Programs</p>
              </div>
              <p className="text-2xl font-bold text-white">{registrationStats.uniquePrograms}</p>
              <p className="text-xs text-white/50 mt-1">Unique</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <Users className="h-4 w-4" />
                <p className="text-xs">Teams</p>
              </div>
              <p className="text-2xl font-bold text-white">{registrationStats.uniqueTeams}</p>
              <p className="text-xs text-white/50 mt-1">Participating</p>
            </div>
          </div>

          {/* Top Programs */}
          {registrationStats.topPrograms.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-fuchsia-400" />
                <p className="text-sm font-semibold text-white">Top Programs by Registrations</p>
              </div>
              <div className="space-y-2">
                {registrationStats.topPrograms.map(([programName, count]) => (
                  <div key={programName} className="flex items-center justify-between">
                    <p className="text-sm text-white/80 truncate flex-1">{programName}</p>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="h-2 w-20 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-rose-500"
                          style={{
                            width: `${registrationStats.total > 0 ? (count / registrationStats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white/60 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Controls */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition-all duration-200 focus-within:border-fuchsia-400/50 focus-within:ring-2 focus-within:ring-fuchsia-400/30">
              <Search className="mr-2 h-4 w-4 text-white/50 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SearchSelect
                name="registration_team_filter"
                value={registrationTeamFilter}
                onValueChange={setRegistrationTeamFilter}
                className="w-full"
                options={teamOptions}
                placeholder="Filter by team"
              />
              <SearchSelect
                name="registration_group_by"
                value={registrationGroupBy}
                onValueChange={(value) =>
                  setRegistrationGroupBy(value as "all" | "program" | "team")
                }
                className="w-full"
                options={[
                  { value: "all", label: "View All" },
                  { value: "program", label: "Group by Program" },
                  { value: "team", label: "Group by Team" },
                ]}
                placeholder="Group by"
              />
            </div>
          </div>

          {/* Registrations List */}
          <div className="max-h-[350px] space-y-3 overflow-y-auto">
            {filteredRegistrations.length === 0 ? (
              <p className="text-center text-sm text-white/60 py-8">
                {searchQuery || registrationTeamFilter
                  ? "No registrations found"
                  : "No registrations available"}
              </p>
            ) : registrationGroupBy === "all" ? (
              filteredRegistrations.map((reg) => {
                const teamName = teams.find(t => t.id === reg.teamId)?.teamName || reg.teamId;
                return (
                  <div
                    key={reg.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-white">{reg.programName}</p>
                        <p className="text-sm text-white/70 mt-1">
                          {reg.studentName} <span className="text-white/50">({reg.studentChest})</span>
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          Team: {teamName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              groupedRegistrations.map(([groupKey, regs]) => {
                const teamName = registrationGroupBy === "team"
                  ? teams.find(t => t.id === groupKey || t.teamName === groupKey)?.teamName || groupKey
                  : groupKey;
                return (
                  <div
                    key={groupKey}
                    className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                    <div className="bg-white/5 p-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">
                          {teamName}
                        </p>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                          {regs.length} {regs.length === 1 ? "registration" : "registrations"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {regs.map((reg) => {
                        const regTeamName = teams.find(t => t.id === reg.teamId)?.teamName || reg.teamId;
                        return (
                          <div
                            key={reg.id}
                            className="rounded-lg border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-colors"
                          >
                            <p className="text-sm font-medium text-white">{reg.studentName}</p>
                            <p className="text-xs text-white/60 mt-1">
                              {reg.studentChest}
                              {registrationGroupBy === "program" && (
                                <> · {regTeamName}</>
                              )}
                              {registrationGroupBy === "team" && (
                                <> · {reg.programName}</>
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        open={Boolean(editingTeam)}
        onClose={() => setEditingTeam(null)}
        title="Edit Team"
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditingTeam(null)}>
              Cancel
            </Button>
          </>
        }
      >
        {editingTeam && (
          <form action={handleUpdateTeam} className="space-y-4">
            <input type="hidden" name="id" value={editingTeam.id} />
            <div>
              <label className="text-sm font-semibold text-white/70 mb-2 block">
                Team Name
              </label>
              <Input
                name="teamName"
                defaultValue={editingTeam.teamName}
                placeholder="Team name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white/70 mb-2 block">
                Leader Name
              </label>
              <Input
                name="leaderName"
                defaultValue={editingTeam.leaderName}
                placeholder="Leader name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white/70 mb-2 block">
                Password
              </label>
              <Input
                name="password"
                type="text"
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-white/40 mt-1">
                For security, existing passwords are not shown. Enter a new one to update.
              </p>
            </div>
             <div>
              <label className="text-sm font-semibold text-white/70 mb-2 block">
                Team Gender / Type
              </label>
              <select
                name="gender"
                defaultValue={editingTeam.gender || "mixed"}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                required
              >
                <option value="mixed">Mixed Team (Boys & Girls)</option>
                <option value="boys">Boys Team</option>
                <option value="girls">Girls Team</option>
              </select>
            </div>
            <ColorSelectorInput
              key={editingTeam.id}
              name="themeColor"
              defaultValue={editingTeam.themeColor || "#E11D48"}
            />
            <SubmitButton>
              Save Changes
            </SubmitButton>
          </form>
        )}
      </Modal>

      {/* View Team Details Modal */}
      <Modal
        open={Boolean(viewingTeam)}
        onClose={() => setViewingTeam(null)}
        title={viewingTeam?.teamName ?? ""}
        actions={
          <Button variant="secondary" onClick={() => setViewingTeam(null)}>
            Close
          </Button>
        }
      >
        {viewingTeam && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/50">Team ID</p>
              <p className="text-sm text-white">{viewingTeam.id}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Leader</p>
              <p className="text-sm text-white">{viewingTeam.leaderName}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Team Gender / Type</p>
              <p className="text-sm text-white capitalize">{viewingTeam.gender ?? "mixed"}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Theme Color</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="h-6 w-6 rounded border border-white/20"
                  style={{ backgroundColor: viewingTeam.themeColor || "#0ea5e9" }}
                />
                <p className="text-sm text-white">{viewingTeam.themeColor || "#0ea5e9"}</p>
              </div>
            </div>
            {(() => {
              const stats = getTeamStats(viewingTeam.id);
              const teamStudents = students.filter((s) => s.teamId === viewingTeam.id);
              const teamRegistrations = registrations.filter((r) => r.teamId === viewingTeam.id);
              return (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50 mb-2">
                      Statistics: {stats.studentCount} students, {stats.registrationCount}{" "}
                      registrations
                    </p>
                  </div>
                  {teamStudents.length > 0 && (
                    <div>
                      <p className="text-xs text-white/50 mb-2">Students</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {teamStudents.map((student) => (
                          <p key={student.id} className="text-sm text-white/80">
                            {student.name} ({student.chestNumber})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {teamRegistrations.length > 0 && (
                    <div>
                      <p className="text-xs text-white/50 mb-2">Registrations</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {teamRegistrations.map((reg) => (
                          <p key={reg.id} className="text-sm text-white/80">
                            {reg.programName} - {reg.studentName} ({reg.studentChest})
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Team"
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Are you sure you want to delete this team? This action cannot be undone. This will also delete all students and registrations associated with this team.
            </p>
            <form action={handleDeleteTeam}>
              <input type="hidden" name="teamId" value={deleteConfirm} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <DeleteButton>Delete Team</DeleteButton>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {activeReportConfig && (
        <ReportPrintModal
          open={!!activeReportConfig}
          onClose={() => setActiveReportConfig(null)}
          config={activeReportConfig}
        />
      )}
    </>
  );
});

