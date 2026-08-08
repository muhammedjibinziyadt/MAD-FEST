"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { CheckCircle2, Eye, Pencil, Search, Trash2, Download, FileText, FileSpreadsheet, User, Printer, Copy, Check, ExternalLink, QrCode, Trophy, Shield, Tag, Sparkles } from "lucide-react";

import { Button, SubmitButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchSelect } from "@/components/ui/search-select";
import { useDebounce } from "@/hooks/use-debounce";
import type { Student, Team, Program, ProgramRegistration } from "@/lib/types";
import { ReportPrintModal } from "@/components/ui/report-print-modal";

import { sortStudentsByChestNumber } from "@/lib/chest-utils";

interface StudentManagerProps {
  students: Student[];
  teams: Team[];
  programs?: Program[];
  registrations?: ProgramRegistration[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  bulkDeleteAction: (formData: FormData) => Promise<void>;
}

type SortOption = "latest" | "az" | "chest";

const pageSizeOptions = [
  { label: "8 / page", value: "8" },
  { label: "15 / page", value: "15" },
  { label: "25 / page", value: "25" },
];

export const StudentManager = React.memo(function StudentManager({
  students,
  teams,
  programs = [],
  registrations = [],
  updateAction,
  deleteAction,
  bulkDeleteAction,
}: StudentManagerProps) {
  const teamOptions = useMemo(
    () => [
      { value: "", label: "All Teams" },
      ...teams.map((team) => ({
        value: team.id,
        label: team.gender && team.gender !== "mixed"
          ? `${team.name} (${team.gender === "boys" ? "Boys" : "Girls"})`
          : team.name,
      })),
    ],
    [teams],
  );
  const teamMap = useMemo(
    () => new Map(
      teams.map((team) => [
        team.id,
        team.gender && team.gender !== "mixed"
          ? `${team.name} (${team.gender === "boys" ? "Boys" : "Girls"})`
          : team.name,
      ])
    ),
    [teams]
  );
  
  const programOptions = useMemo(
    () => [
      { value: "", label: "All Programs" },
      ...programs.map((program) => ({
        value: program.id,
        label: program.name,
        meta: `${program.section} · ${program.category !== "none" ? `Cat ${program.category}` : "General"}`,
      })),
    ],
    [programs],
  );
  const programMap = useMemo(() => new Map(programs.map((program) => [program.id, program.name])), [programs]);
  
  const studentRegistrationsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    registrations.forEach((registration) => {
      if (!map.has(registration.studentId)) {
        map.set(registration.studentId, new Set());
      }
      map.get(registration.studentId)!.add(registration.programId);
    });
    return map;
  }, [registrations]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [teamFilter, setTeamFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("chest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(Number(pageSizeOptions[0].value));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);



  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, teamFilter, programFilter, genderFilter, categoryFilter, sort]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const query = debouncedSearchQuery.trim().toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(query) || student.chest_no.toLowerCase().includes(query);
      const matchesTeam = teamFilter ? student.team_id === teamFilter : true;
      const matchesProgram = programFilter
        ? studentRegistrationsMap.get(student.id)?.has(programFilter) ?? false
        : true;
      const matchesGender = genderFilter ? student.gender === genderFilter : true;
      const matchesCategory = categoryFilter ? student.category === categoryFilter : true;
      return matchesSearch && matchesTeam && matchesProgram && matchesGender && matchesCategory;
    });
  }, [students, debouncedSearchQuery, teamFilter, programFilter, genderFilter, categoryFilter, studentRegistrationsMap]);

  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    if (sort === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "chest") {
      return sortStudentsByChestNumber(list);
    } else {
      list.sort((a, b) => b.id.localeCompare(a.id));
    }
    return list;
  }, [filteredStudents, sort]);

  const selectedTeamObj = useMemo(() => teams.find((t) => t.id === teamFilter), [teams, teamFilter]);
  const reportTitle = selectedTeamObj ? selectedTeamObj.name.toUpperCase() : "STUDENTS LIST REPORT";
  const reportSubtitle = genderFilter === "boy" ? "Boys" : genderFilter === "girl" ? "Girls" : "All Students";

  const reportConfig = useMemo(() => ({
    title: reportTitle,
    subtitle: reportSubtitle,
    columns: [
      { header: "no", render: (_: any, idx: number) => idx + 1, align: "center" as const, width: "60px" },
      { header: "Students name", render: (student: Student) => student.name, align: "left" as const },
      { header: "Chest number", render: (student: Student) => student.chest_no, align: "center" as const, width: "130px" },
      { header: "Team", render: (student: Student) => teams.find((t) => t.id === student.team_id)?.name || "Unknown", align: "left" as const },
      { header: "Category", render: (student: Student) => student.category || "GENERAL", align: "center" as const, width: "160px" },
    ],
    data: sortedStudents,
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, "_")}_report`,
  }), [reportTitle, reportSubtitle, sortedStudents, teams]);

  useEffect(() => {
    const available = new Set(sortedStudents.map((student) => student.id));
    setSelected((prev) => {
      const filtered = new Set(Array.from(prev).filter((id) => available.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [sortedStudents]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize)) || 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const visibleStudents = sortedStudents.slice(startIndex, startIndex + pageSize);
  const showingFrom = sortedStudents.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, sortedStudents.length);
  const hasSelection = selected.size > 0;
  const selectedIdsValue = Array.from(selected).join(",");
  const allSelected = sortedStudents.length > 0 && sortedStudents.every((student) => selected.has(student.id));

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelected(new Set(sortedStudents.map((student) => student.id)));
    } else {
      setSelected(new Set());
    }
  }, [sortedStudents]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const viewStudent = viewStudentId ? students.find((student) => student.id === viewStudentId) : null;

  const exportToCSV = () => {
    const headers = ["Name", "Chest Number", "Team", "Total Points"];
    const rows = sortedStudents.map((student) => [
      student.name,
      student.chest_no,
      teamMap.get(student.team_id) ?? "Unknown",
      student.total_points.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `students_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Students Roster", 14, 22);
      
      doc.setFontSize(11);
      const dateStr = new Date().toLocaleDateString();
      let yPos = 30;
      doc.text(`Generated on: ${dateStr}`, 14, yPos);
      yPos += 8;
      
      if (teamFilter) {
        doc.text(`Team: ${teamMap.get(teamFilter) ?? "Unknown"}`, 14, yPos);
        yPos += 6;
      }
      if (programFilter) {
        doc.text(`Program: ${programMap.get(programFilter) ?? "Unknown"}`, 14, yPos);
        yPos += 6;
      }
      
      yPos += 4;
      
      const headers = ["Name", "Chest Number", "Team", "Total Points"];
      const colWidths = [60, 40, 50, 30];
      const startX = 14;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      let xPos = startX;
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPos);
        xPos += colWidths[i];
      });
      
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      sortedStudents.forEach((student, index) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        xPos = startX;
        const rowData = [
          student.name,
          student.chest_no,
          teamMap.get(student.team_id) ?? "Unknown",
          student.total_points.toString(),
        ];
        
        rowData.forEach((cell, i) => {
          const cellText = doc.splitTextToSize(cell, colWidths[i] - 2);
          doc.text(cellText, xPos, yPos);
          xPos += colWidths[i];
        });
        
        yPos += 7;
      });

      doc.save(`students_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export requires jsPDF library. Please install it: npm install jspdf");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(8,47,73,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">Students roster</p>
          <h2 className="text-2xl font-semibold text-white">Manage participants</h2>
          <p className="text-sm text-white/60">Search, filter, edit, or bulk-delete student entries.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg"
          >
            <Printer className="h-4 w-4" /> Download / Print Report
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            disabled={!hasSelection}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Bulk delete ({selected.size})
          </Button>
        </div>
      </div>

      <div className="relative z-20 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="relative z-20 md:col-span-2 flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 transition-all duration-200 hover:border-white/20 focus-within:border-fuchsia-400/50 focus-within:ring-2 focus-within:ring-fuchsia-400/30 focus-within:bg-white/10">
          <Search className="mr-2 h-4 w-4 text-white/50 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search by name or chest number"
            className="border-none bg-transparent px-0 placeholder:text-white/40"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <SearchSelect
          name="team_filter"
          options={teamOptions}
          value={teamFilter}
          onValueChange={setTeamFilter}
          placeholder="Filter by team"
        />
        <SearchSelect
          name="gender_filter"
          options={[
            { value: "", label: "All Genders" },
            { value: "boy", label: "Boys" },
            { value: "girl", label: "Girls" },
          ]}
          value={genderFilter}
          onValueChange={setGenderFilter}
          placeholder="Filter by gender"
        />
        <SearchSelect
          name="category_filter"
          options={[
            { value: "", label: "All Categories" },
            { value: "KIDDIES", label: "KIDDIES" },
            { value: "SUB-JUNIOR", label: "SUB-JUNIOR" },
            { value: "JUNIOR", label: "JUNIOR" },
            { value: "SENIOR", label: "SENIOR" },
            { value: "SUPER-SENIOR", label: "SUPER-SENIOR" },
            { value: "GENERAL", label: "GENERAL" },
          ]}
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="Filter by category"
        />
        <SearchSelect
          name="page_size"
          options={pageSizeOptions}
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
          placeholder="Page size"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-white/50">Quick sort</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Latest", value: "latest" },
            { label: "A-Z Name", value: "az" },
            { label: "Chest No.", value: "chest" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value as SortOption)}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                sort === option.value
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-white/60">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          {sortedStudents.length} students
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest text-white/50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => toggleSelectAll(event.target.checked)}
            />
            Select all
          </div>
          <span className="flex-1">Student</span>
          <span>Team</span>
          <span>Chest No.</span>
          <span>Actions</span>
        </div>

        {visibleStudents.map((student) => {
          const isSelected = selected.has(student.id);
          const isEditing = editingId === student.id;
          return (
            <div
              key={student.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/40 px-4 py-4 shadow-[0_15px_60px_rgba(15,23,42,0.45)] transition hover:border-fuchsia-400/40"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(student.id)}
                  />
                  {student.avatar ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-fuchsia-500/30">
                      <Image
                        src={student.avatar}
                        alt={student.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 p-2.5 shrink-0">
                      <User className="h-5 w-5 text-fuchsia-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white/40">#{student.id.slice(0, 8)}</p>
                    <p className="text-lg font-semibold text-white">{student.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60 w-full xl:flex-1">
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    {teamMap.get(student.team_id) ?? "Unknown team"}
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1">Chest #{student.chest_no}</span>
                  {student.gender && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        student.gender === "boy"
                          ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                          : "border-pink-500/40 bg-pink-500/10 text-pink-400"
                      }`}
                    >
                      {student.gender === "boy" ? "Boy" : "Girl"}
                    </span>
                  )}
                  {student.category && student.category !== "none" && (
                    <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {student.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 w-full xl:ml-auto xl:w-auto xl:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => setViewStudentId(student.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 border border-white/15 bg-white/5"
                    onClick={() => setEditingId((prev) => (prev === student.id ? null : student.id))}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={student.id} />
                    <SubmitButton variant="danger" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
              {isEditing && (
                <form
                  action={updateAction}
                  className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white md:grid-cols-3"
                >
                  <input type="hidden" name="id" value={student.id} />
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Student Name</label>
                    <Input name="name" defaultValue={student.name} placeholder="Student name" />
                  </div>
                  <input type="hidden" name="chest_no" value={student.chest_no} />
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Chest Number</label>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                      Chest: {student.chest_no}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Team</label>
                    <SearchSelect
                      name="team_id"
                      defaultValue={student.team_id}
                      options={teams.map((team) => ({
                        value: team.id,
                        label: team.gender && team.gender !== "mixed"
                          ? `${team.name} (${team.gender === "boys" ? "Boys" : "Girls"})`
                          : team.name,
                      }))}
                      placeholder="Select team"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Gender</label>
                    <select
                      name="gender"
                      defaultValue={student.gender ?? ""}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Category</label>
                    <select
                      name="category"
                      defaultValue={student.category ?? "none"}
                      className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                    >
                      <option value="none">General / None</option>
                      <option value="KIDDIES">KIDDIES</option>
                      <option value="SUB-JUNIOR">SUB-JUNIOR</option>
                      <option value="JUNIOR">JUNIOR</option>
                      <option value="SENIOR">SENIOR</option>
                      <option value="SUPER-SENIOR">SUPER-SENIOR</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs text-white/60 mb-1.5 block">Update Photo (Optional)</label>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-fuchsia-500/20 file:text-fuchsia-400 hover:file:bg-fuchsia-500/30 file:cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-3">
                    <SubmitButton className="flex-1">
                      Save changes
                    </SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
        {visibleStudents.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/60">
            No students match your filters.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        <p>
          Showing{" "}
          <span className="font-semibold text-white">
            {sortedStudents.length === 0 ? 0 : `${showingFrom}-${showingTo}`}
          </span>{" "}
          of <span className="font-semibold text-white">{sortedStudents.length}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/5"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <div className="rounded-xl border border-white/10 px-4 py-1 text-xs uppercase tracking-widest text-white/80">
            Page {page} of {totalPages}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/5"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || sortedStudents.length === 0}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(viewStudent)}
        onClose={() => setViewStudentId(null)}
        title="Student Profile Details"
        size="md"
        actions={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            {viewStudent && (
              <a
                href={`/participant/${viewStudent.chest_no}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-3.5 py-1.5 text-xs font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 hover:text-white transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Candidate Page
              </a>
            )}
            <Button variant="secondary" onClick={() => setViewStudentId(null)}>
              Close
            </Button>
          </div>
        }
      >
        {viewStudent && (
          <div className="space-y-4 py-1">
            {/* Header Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/80 p-5 shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                {viewStudent.avatar ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-fuchsia-500/40 shadow-xl shadow-fuchsia-500/20">
                    <Image
                      src={viewStudent.avatar}
                      alt={viewStudent.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20 p-3 shadow-xl">
                    <User className="h-10 w-10 text-fuchsia-300" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 text-xs font-mono font-bold text-emerald-300 shadow-sm">
                      <Tag className="h-3 w-3" />
                      Chest #{viewStudent.chest_no}
                    </span>
                    {viewStudent.gender && (
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          viewStudent.gender === "boy"
                            ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                            : "border-pink-500/30 bg-pink-500/10 text-pink-400"
                        }`}
                      >
                        {viewStudent.gender === "boy" ? "Boy" : "Girl"}
                      </span>
                    )}
                    {viewStudent.category && viewStudent.category !== "none" && (
                      <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-fuchsia-300">
                        {viewStudent.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{viewStudent.name}</h3>
                  <p className="text-xs text-white/60 font-medium flex items-center justify-center gap-1.5 sm:justify-start">
                    <Shield className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    {teamMap.get(viewStudent.team_id) ?? "Unknown Team"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats & Detail Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Chest Number Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-400" />
                    Chest Number
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(viewStudent.chest_no);
                      setCopiedKey("chest");
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    {copiedKey === "chest" ? (
                      <>
                        <Check className="h-3 w-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-lg font-mono font-bold text-emerald-300">{viewStudent.chest_no}</p>
              </div>

              {/* Total Points Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-amber-500/30">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  Total Points
                </span>
                <p className="mt-1 text-lg font-bold text-amber-300">
                  {viewStudent.total_points ?? 0} <span className="text-xs font-normal text-amber-400/70">pts</span>
                </p>
              </div>

              {/* Team Name Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-cyan-500/30 sm:col-span-2">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  Assigned Team
                </span>
                <p className="mt-1 text-sm font-semibold text-white">
                  {teamMap.get(viewStudent.team_id) ?? "Unknown Team"}
                </p>
              </div>
            </div>

            {/* Registered Programs Section */}
            {(() => {
              const regSet = studentRegistrationsMap.get(viewStudent.id);
              if (!regSet || regSet.size === 0) return null;
              const registeredPrograms = Array.from(regSet).map((pid) => programMap.get(pid)).filter(Boolean);
              if (registeredPrograms.length === 0) return null;

              return (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-white/60">
                    <span className="uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                      Registered Events ({registeredPrograms.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {registeredPrograms.map((progName, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-medium text-fuchsia-200"
                      >
                        {progName}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Unique Student ID Footer Strip */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white/50 font-mono">
              <span className="truncate max-w-[240px] sm:max-w-none">ID: {viewStudent.id}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(viewStudent.id);
                  setCopiedKey("id");
                  setTimeout(() => setCopiedKey(null), 2000);
                }}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white transition shrink-0"
              >
                {copiedKey === "id" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy ID
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm bulk delete"
        actions={
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        }
      >
        <p className="text-sm text-white/70">
          You are deleting {selected.size} student{selected.size === 1 ? "" : "s"}. This cannot be undone.
        </p>
        <form action={bulkDeleteAction} className="space-y-4">
          <input type="hidden" name="student_ids" value={selectedIdsValue} />
          <SubmitButton variant="danger" className="w-full" disabled={!hasSelection}>
            Delete {selected.size} student{selected.size === 1 ? "" : "s"}
          </SubmitButton>
        </form>
      </Modal>

      <ReportPrintModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        config={reportConfig}
      />
    </div>
  );
});


