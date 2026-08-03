"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Pencil, Search, Trash2, Calendar, User, Users, Award, FileText, Layers, Download, FileSpreadsheet, Printer } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchSelect } from "@/components/ui/search-select";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import type { Program, ResultRecord, Jury, Student, Team, ProgramRegistration } from "@/lib/types";
import { ReportPrintModal } from "@/components/ui/report-print-modal";

interface ResultManagerProps {
  results: ResultRecord[];
  programs: Program[];
  juries: Jury[];
  students: Student[];
  teams: Team[];
  registrations?: ProgramRegistration[];
  deleteAction: (formData: FormData) => Promise<void>;
  approveAction?: (formData: FormData) => Promise<void>;
  rejectAction?: (formData: FormData) => Promise<void>;
  isPending?: boolean;
}

type SortOption = "latest" | "program" | "jury" | "score";

const pageSizeOptions = [
  { label: "8 / page", value: "8" },
  { label: "15 / page", value: "15" },
  { label: "25 / page", value: "25" },
];

export const ResultManager = React.memo(function ResultManager({
  results,
  programs,
  juries,
  students,
  teams,
  registrations = [],
  deleteAction,
  approveAction,
  rejectAction,
  isPending = false,
}: ResultManagerProps) {
  const programMap = useMemo(() => new Map(programs.map((p) => [p.id, p])), [programs]);
  const juryMap = useMemo(() => new Map(juries.map((j) => [j.id, j])), [juries]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const programOptions = useMemo(
    () => [{ value: "", label: "All Programs" }, ...programs.map((p) => ({ value: p.id, label: p.name }))],
    [programs],
  );
  const juryOptions = useMemo(
    () => [{ value: "", label: "All Juries" }, ...juries.map((j) => ({ value: j.id, label: j.name }))],
    [juries],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [programFilter, setProgramFilter] = useState("");
  const [juryFilter, setJuryFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(Number(pageSizeOptions[0].value));
  const [viewResult, setViewResult] = useState<ResultRecord | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, programFilter, juryFilter, sort]);

  // Determine Gender (BOYS / GIRLS / MIXED) for a Result
  const getResultGender = (result: ResultRecord): "BOYS" | "GIRLS" | "MIXED" => {
    const program = programMap.get(result.program_id);
    let boyCount = 0;
    let girlCount = 0;

    for (const entry of result.entries) {
      if (entry.student_id) {
        const student = studentMap.get(entry.student_id);
        if (student?.gender === "boy") boyCount++;
        if (student?.gender === "girl") girlCount++;
      }
      if (entry.team_id) {
        const team = teamMap.get(entry.team_id);
        const genderLower = String((team as any)?.gender ?? "").toLowerCase();
        if (genderLower.includes("boy")) boyCount++;
        if (genderLower.includes("girl")) girlCount++;
      }
    }

    if (boyCount > 0 && girlCount === 0) return "BOYS";
    if (girlCount > 0 && boyCount === 0) return "GIRLS";
    if (boyCount > 0 && girlCount > 0) return "MIXED";

    const progName = program?.name.toLowerCase() ?? "";
    if (progName.includes("girl") || progName.includes("female") || progName.includes("പെൺ")) return "GIRLS";
    if (progName.includes("boy") || progName.includes("male") || progName.includes("ആൺ")) return "BOYS";

    return "BOYS";
  };

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const program = programMap.get(result.program_id);
      const jury = juryMap.get(result.jury_id);
      const query = debouncedSearchQuery.trim().toLowerCase();

      const matchesSearch =
        program?.name.toLowerCase().includes(query) ||
        jury?.name.toLowerCase().includes(query) ||
        result.id.toLowerCase().includes(query);
      const matchesProgram = programFilter ? result.program_id === programFilter : true;
      const matchesJury = juryFilter ? result.jury_id === juryFilter : true;

      return matchesSearch && matchesProgram && matchesJury;
    });
  }, [results, debouncedSearchQuery, programFilter, juryFilter, programMap, juryMap]);

  const sortedResults = useMemo(() => {
    const list = [...filteredResults];
    if (sort === "program") {
      list.sort((a, b) => {
        const aName = programMap.get(a.program_id)?.name ?? "";
        const bName = programMap.get(b.program_id)?.name ?? "";
        return aName.localeCompare(bName);
      });
    } else if (sort === "jury") {
      list.sort((a, b) => {
        const aName = juryMap.get(a.jury_id)?.name ?? "";
        const bName = juryMap.get(b.jury_id)?.name ?? "";
        return aName.localeCompare(bName);
      });
    } else if (sort === "score") {
      list.sort((a, b) => {
        const aScore = a.entries.reduce((sum, e) => sum + e.score, 0);
        const bScore = b.entries.reduce((sum, e) => sum + e.score, 0);
        return bScore - aScore;
      });
    } else {
      list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    }
    return list;
  }, [filteredResults, sort, programMap, juryMap]);

  const totalPages = Math.ceil(sortedResults.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedResults.slice(start, start + pageSize);
  }, [sortedResults, page, pageSize]);

  const getWinnerName = (entry: ResultRecord["entries"][number]) => {
    if (entry.student_id) {
      const student = studentMap.get(entry.student_id);
      return student?.name ?? "Unknown Student";
    }
    if (entry.team_id) {
      const team = teamMap.get(entry.team_id);
      return team?.name ?? "Unknown Team";
    }
    return "Unknown";
  };

  const getTotalScore = (result: ResultRecord) => {
    const entriesTotal = result.entries.reduce((sum, entry) => sum + entry.score, 0);
    const penaltiesTotal = result.penalties?.reduce((sum, p) => sum + p.points, 0) ?? 0;
    return Math.max(0, entriesTotal - penaltiesTotal);
  };

  const getPenaltyTotal = (result: ResultRecord) => {
    return result.penalties?.reduce((sum, p) => sum + p.points, 0) ?? 0;
  };

  const getWinnerChest = (entry: ResultRecord["entries"][number]) => {
    if (entry.student_id) {
      const student = studentMap.get(entry.student_id);
      return student?.chest_no ?? "";
    }
    return "";
  };

  const getWinnerTeam = (entry: ResultRecord["entries"][number]) => {
    if (entry.student_id) {
      const student = studentMap.get(entry.student_id);
      if (student?.team_id) {
        const team = teamMap.get(student.team_id);
        return team?.name ?? "Unknown Team";
      }
    }
    if (entry.team_id) {
      const team = teamMap.get(entry.team_id);
      return team?.name ?? "Unknown Team";
    }
    return "";
  };

  const [showReportModal, setShowReportModal] = useState(false);

  const reportTitle = isPending ? "PENDING RESULTS REPORT" : "APPROVED RESULTS REPORT";
  const reportSubtitle = "Official Fest Competition Results";

  const reportConfig = useMemo(() => ({
    title: reportTitle,
    subtitle: reportSubtitle,
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Program Name", render: (r: ResultRecord) => programMap.get(r.program_id)?.name || "Unknown", align: "left" as const },
      { header: "Category", render: (r: ResultRecord) => programMap.get(r.program_id)?.category || "GENERAL", align: "center" as const, width: "120px" },
      { header: "1st Place Winner", render: (r: ResultRecord) => {
        const e1 = r.entries.find((e) => e.position === 1);
        return e1 ? getWinnerName(e1) : "-";
      }, align: "left" as const },
      { header: "1st Team", render: (r: ResultRecord) => {
        const e1 = r.entries.find((e) => e.position === 1);
        return e1 ? getWinnerTeam(e1) : "-";
      }, align: "left" as const },
      { header: "Status", render: (r: ResultRecord) => r.status.toUpperCase(), align: "center" as const, width: "110px" },
    ],
    data: sortedResults,
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, "_")}_report`,
  }), [reportTitle, reportSubtitle, sortedResults, programMap]);

  const exportToCSV = () => {
    const headers = [
      "Result ID",
      "Program Name",
      "Category",
      "Section",
      "Gender",
      "Jury",
      "1st Place Winner",
      "1st Place Chest",
      "1st Place Team",
      "1st Place Score",
      "2nd Place Winner",
      "2nd Place Chest",
      "2nd Place Team",
      "2nd Place Score",
      "3rd Place Winner",
      "3rd Place Chest",
      "3rd Place Team",
      "3rd Place Score",
      "Penalties",
      "Total Score",
      "Submitted At"
    ];

    const rows = sortedResults.map((result) => {
      const program = programMap.get(result.program_id);
      const jury = juryMap.get(result.jury_id);
      const totalScore = getTotalScore(result);
      const gender = getResultGender(result);

      const first = result.entries.find((e) => e.position === 1);
      const second = result.entries.find((e) => e.position === 2);
      const third = result.entries.find((e) => e.position === 3);

      return [
        result.id,
        program?.name ?? "",
        program?.category ?? "",
        program?.section ?? "",
        gender,
        jury?.name ?? "",
        first ? getWinnerName(first) : "",
        first ? getWinnerChest(first) : "",
        first ? getWinnerTeam(first) : "",
        first ? first.score.toString() : "",
        second ? getWinnerName(second) : "",
        second ? getWinnerChest(second) : "",
        second ? getWinnerTeam(second) : "",
        second ? second.score.toString() : "",
        third ? getWinnerName(third) : "",
        third ? getWinnerChest(third) : "",
        third ? getWinnerTeam(third) : "",
        third ? third.score.toString() : "",
        getPenaltyTotal(result).toString(),
        totalScore.toString(),
        new Date(result.submitted_at).toISOString()
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `results_report_${isPending ? "pending" : "approved"}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable") as any;
      const doc = new jsPDF("landscape");

      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text(isPending ? "Funoon Fiesta - Pending Results Report" : "Funoon Fiesta - Approved Results Ledger", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Filtered: ${filteredResults.length} records`, 14, 27);

      const tableData = sortedResults.map((result) => {
        const program = programMap.get(result.program_id);
        const jury = juryMap.get(result.jury_id);
        const totalScore = getTotalScore(result);
        const gender = getResultGender(result);

        const winnersStr = result.entries
          .map((e) => {
            const posStr = e.position === 1 ? "1st" : e.position === 2 ? "2nd" : "3rd";
            const chestStr = getWinnerChest(e) ? ` (#${getWinnerChest(e)})` : "";
            return `${posStr}: ${getWinnerName(e)}${chestStr} - ${getWinnerTeam(e)} [${e.score} pts]`;
          })
          .join("\n");

        return [
          result.id.slice(0, 8),
          program?.name ?? "",
          `${gender} / ${program?.category ?? ""} / ${program?.section ?? ""}`,
          jury?.name ?? "",
          winnersStr,
          getPenaltyTotal(result) > 0 ? `-${getPenaltyTotal(result)} pts` : "0",
          `${totalScore} pts`,
        ];
      });

      autoTable(doc, {
        startY: 32,
        head: [["ID", "Program Name", "Target Details", "Jury", "Winners & Teams Breakdown", "Penalty", "Total Score"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          4: { cellWidth: 100 }
        }
      });

      doc.save(`results_report_${isPending ? "pending" : "approved"}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Make sure you are connected to the internet to load libraries.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Title & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(8,47,73,0.35)]">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Results Registry</p>
          <h2 className="text-2xl font-bold text-white mt-1">
            {isPending ? "Pending Results List" : "Approved Results Ledger"}
          </h2>
          <p className="text-sm text-white/60 mt-1">
            {isPending
              ? "Review, approve, or reject recently submitted results from juries."
              : "Search, filter, view details, or delete finalized program results."}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg"
          >
            <Printer className="h-4 w-4" /> Download / Print Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by program, jury, or ID..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <SearchSelect
              name="program_filter"
              options={programOptions}
              value={programFilter}
              onValueChange={setProgramFilter}
              placeholder="All Programs"
            />
          </div>
          <div className="w-48">
            <SearchSelect
              name="jury_filter"
              options={juryOptions}
              value={juryFilter}
              onValueChange={setJuryFilter}
              placeholder="All Juries"
            />
          </div>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-white/40 font-semibold mr-1">Quick Sort:</span>
          {(["latest", "program", "jury", "score"] as SortOption[]).map((option) => (
            <Button
              key={option}
              type="button"
              variant={sort === option ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSort(option)}
              className="text-xs capitalize"
            >
              {option === "latest" ? "Latest First" : option === "score" ? "Highest Score" : `${option} A-Z`}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32">
            <SearchSelect
              name="page_size"
              options={pageSizeOptions}
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(Number(val))}
            />
          </div>
          <span className="text-xs text-white/50">{filteredResults.length} results</span>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {paginatedResults.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
            No results found.
          </div>
        ) : (
          paginatedResults.map((result) => {
            const program = programMap.get(result.program_id);
            const jury = juryMap.get(result.jury_id);
            const totalScore = getTotalScore(result);
            const gender = getResultGender(result);

            return (
              <div
                key={result.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-800/50 p-5 shadow-xl transition hover:border-cyan-500/40"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                  {/* Left Column: Program Info & Badges */}
                  <div className="w-full xl:flex-1">
                    <p className="text-xs text-white/40 font-mono mb-1">#{result.id.slice(0, 8)}</p>
                    <p className="text-xl font-bold text-white mb-2">{program?.name ?? "Unknown Program"}</p>

                    {/* Gender, Category, and Section Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${gender === "BOYS"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : gender === "GIRLS"
                            ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}>
                        {gender === "BOYS" ? "👦 BOYS" : gender === "GIRLS" ? "👧 GIRLS" : "👥 MIXED"}
                      </span>

                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                        🏷️ {program?.category || "GENERAL"}
                      </span>

                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                        {program?.section || "general"}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-cyan-400" />
                      Jury: <span className="text-white/80 font-medium">{jury?.name ?? "Unknown Jury"}</span>
                    </p>
                  </div>

                  {/* Middle Column: Winners Grid */}
                  <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:gap-3 xl:max-w-md">
                    {result.entries.map((entry, index) => (
                      <div
                        key={entry.student_id || entry.team_id || `${entry.position}-${index}`}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center min-w-[100px]"
                      >
                        <p className="text-xs font-semibold text-amber-400">
                          {entry.position === 1 ? "🥇 1st" : entry.position === 2 ? "🥈 2nd" : "🥉 3rd"}
                        </p>
                        <p className="text-sm font-semibold text-white truncate max-w-[140px]">{getWinnerName(entry)}</p>
                        <p className="text-xs text-emerald-300 font-bold">{entry.score} pts</p>
                      </div>
                    ))}
                    {(result.penalties?.length ?? 0) > 0 && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center">
                        <p className="text-xs text-red-200/90 font-bold">Penalty</p>
                        <p className="text-sm font-semibold text-red-300">
                          -{getPenaltyTotal(result)} pts
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Score & Actions */}
                  <div className="text-center w-full sm:w-auto">
                    <p className="text-2xl font-bold text-emerald-300">{totalScore}</p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Total Pts</p>
                  </div>

                  <div className="text-sm text-white/70 w-full sm:w-auto text-right">
                    <p className="flex items-center justify-end gap-1 text-xs">
                      <Calendar className="h-3 w-3 text-white/50" />
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {new Date(result.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full xl:ml-auto xl:w-auto xl:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-2 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 border border-cyan-500/40"
                      onClick={() => setViewResult(result)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>

                    <Link href={`/admin/${isPending ? "pending" : "approved"}-results/${result.id}/edit`}>
                      <Button type="button" variant="ghost" size="sm" className="gap-2 border border-white/15 bg-white/5 hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>

                    {isPending && approveAction && (
                      <form action={approveAction}>
                        <input type="hidden" name="id" value={result.id} />
                        <Button type="submit" variant="secondary" size="sm" className="gap-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40">
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                      </form>
                    )}

                    {isPending && rejectAction && (
                      <form action={rejectAction}>
                        <input type="hidden" name="id" value={result.id} />
                        <Button type="submit" variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Reject
                        </Button>
                      </form>
                    )}

                    {!isPending && (
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={result.id} />
                        <Button type="submit" variant="destructive" size="sm" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-white/60">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Result Modal (Eye Icon Click) */}
      {viewResult && (
        <Modal
          open={!!viewResult}
          title={`Result Details • ${programMap.get(viewResult.program_id)?.name ?? "Program"}`}
          onClose={() => setViewResult(null)}
          size="xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Overview and Penalties */}
            <div className="lg:col-span-5 space-y-5">
              {/* Overview Card */}
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Program Name</p>
                    <p className="text-xl font-bold text-white mt-0.5">
                      {programMap.get(viewResult.program_id)?.name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const gender = getResultGender(viewResult);
                      const prog = programMap.get(viewResult.program_id);
                      return (
                        <>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${gender === "BOYS"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : gender === "GIRLS"
                                ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}>
                            {gender === "BOYS" ? "👦 BOYS" : gender === "GIRLS" ? "👧 GIRLS" : "👥 MIXED"}
                          </span>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                            🏷️ {prog?.category || "GENERAL"}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <div>
                    <p className="text-xs text-white/50">Evaluated By Jury</p>
                    <p className="font-semibold text-white mt-0.5">
                      {juryMap.get(viewResult.jury_id)?.name ?? "Admin"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Submitted Time</p>
                    <p className="font-semibold text-white mt-0.5">
                      {new Date(viewResult.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Event Section</p>
                    <p className="font-semibold text-emerald-400 capitalize mt-0.5">
                      {programMap.get(viewResult.program_id)?.section || "single"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Total Awarded Points</p>
                    <p className="text-xl font-bold text-emerald-300 mt-0.5">{getTotalScore(viewResult)} pts</p>
                  </div>
                </div>
              </div>

              {/* Penalties inside modal */}
              {(viewResult.penalties?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 space-y-2">
                  <p className="text-sm font-bold text-red-200">No-Show Deductions / Penalties</p>
                  {viewResult.penalties?.map((penalty, index) => {
                    const student = penalty.student_id ? studentMap.get(penalty.student_id) : undefined;
                    const team = penalty.team_id ? teamMap.get(penalty.team_id) : undefined;
                    return (
                      <div key={`${penalty.team_id ?? penalty.student_id ?? index}`} className="text-sm text-white/80">
                        <p className="font-semibold text-red-300">
                          {student?.name ?? team?.name ?? "Unknown"} · -{penalty.points} pts
                        </p>
                        {student && (
                          <p className="text-xs text-white/50">
                            Chest #{student.chest_no} · Team {teamMap.get(student.team_id)?.name ?? "Unknown"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Winners & Team Members Breakdown */}
            <div className="lg:col-span-7 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <p className="text-base font-bold text-white flex items-center gap-2 sticky top-0 bg-slate-950 py-2 z-10">
                <Award className="w-5 h-5 text-amber-400" />
                Winner Placements & Team Members
              </p>

              {viewResult.entries.map((entry, index) => {
                const winnerName = getWinnerName(entry);
                const student = entry.student_id ? studentMap.get(entry.student_id) : undefined;
                const teamId = entry.team_id || student?.team_id;
                const team = teamId ? teamMap.get(teamId) : undefined;

                // Find team members for this team/program
                const programRegs = registrations.filter(
                  (r) => r.programId === viewResult.program_id && (r.teamId === teamId || r.studentId === student?.id)
                );

                // Only members of the team who participated in this program
                const teamMembers = students.filter(
                  (s) => s.team_id === teamId && programRegs.some((r) => r.studentId === s.id)
                );

                return (
                  <div
                    key={entry.student_id || entry.team_id || `${entry.position}-${index}`}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge tone={entry.position === 1 ? "amber" : entry.position === 2 ? "cyan" : "pink"}>
                          {entry.position === 1 ? "🥇 1st Place" : entry.position === 2 ? "🥈 2nd Place" : "🥉 3rd Place"}
                        </Badge>
                        {entry.grade && entry.grade !== "none" && (
                          <Badge tone="emerald">Grade {entry.grade}</Badge>
                        )}
                      </div>
                      <span className="text-base font-bold text-emerald-300">{entry.score} pts</span>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white">{winnerName}</p>
                      {student && (
                        <p className="text-xs text-white/60 mt-0.5">
                          Chest #{student.chest_no} · Category: {student.category} · Team: <span className="text-cyan-300 font-semibold">{team?.name}</span>
                        </p>
                      )}
                      {!student && team && (
                        <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                          Team: {team.name} {team.leader ? `(Leader: ${team.leader})` : ""}
                        </p>
                      )}
                    </div>

                    {/* TEAM MEMBERS BREAKDOWN */}
                    {team && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {team.name} Participated Members ({teamMembers.length})
                          </p>
                        </div>

                        {teamMembers.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {teamMembers.map((member) => {
                              return (
                                <div
                                  key={member.id}
                                  className="bg-cyan-500/10 border-cyan-500/30 text-cyan-100 rounded-lg p-2 text-xs border"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold truncate">{member.name}</p>
                                    <span className="text-[10px] opacity-75 font-mono">#{member.chest_no}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] opacity-60 mt-1">
                                    <span>{member.category}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic">No registered team members found.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      <ReportPrintModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        config={reportConfig}
      />
    </div>
  );
});
