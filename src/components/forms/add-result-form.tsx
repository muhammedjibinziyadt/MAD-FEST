"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchSelect } from "@/components/ui/search-select";
import { Plus, Trash2, Trophy } from "lucide-react";
import type {
  GradeType,
  Jury,
  Program,
  ProgramRegistration,
  ResultRecord,
  Student,
  Team,
} from "@/lib/types";

interface AddResultFormProps {
  programs: Program[];
  students: Student[];
  teams: Team[];
  juries: Jury[];
  registrations?: ProgramRegistration[];
  approvedResults?: ResultRecord[];
  action: (formData: FormData) => Promise<void>;
  lockProgram?: boolean;
  initial?: Partial<
    Record<
      1 | 2 | 3,
      {
        winnerId: string;
        grade?: GradeType;
      }
    >
  >;
  initialEntries?: {
    position: 1 | 2 | 3;
    winnerId: string;
    grade?: GradeType;
  }[];
  initialPenalties?: {
    targetId?: string;
    points?: number;
    type?: "student" | "team";
  }[];
  submitLabel?: string;
  mode?: "default" | "jury";
  juryName?: string;
  defaultJuryId?: string;
}

const gradeOptions = [
  { value: "A", label: "Grade A (+10)" },
  { value: "B", label: "Grade B (+6)" },
  { value: "C", label: "Grade C (+2)" },
  { value: "none", label: "None" },
];

const positionOptions = [
  { value: "1", label: "🥇 1st Place" },
  { value: "2", label: "🥈 2nd Place" },
  { value: "3", label: "🥉 3rd Place" },
];

interface WinnerRowState {
  id: string;
  position: 1 | 2 | 3;
  winnerId: string;
  grade: GradeType;
}

export function AddResultForm({
  programs,
  students,
  teams,
  juries,
  registrations,
  approvedResults = [],
  action,
  lockProgram = false,
  initial,
  initialEntries,
  initialPenalties,
  submitLabel = "Submit for Approval",
  mode = "default",
  juryName,
  defaultJuryId,
}: AddResultFormProps) {
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [showRules, setShowRules] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string>("");

  // Dynamic winner placements state
  const [winnerRows, setWinnerRows] = useState<WinnerRowState[]>(() => {
    if (initialEntries && initialEntries.length > 0) {
      return initialEntries.map((e, idx) => ({
        id: `row-${idx + 1}`,
        position: e.position,
        winnerId: e.winnerId,
        grade: e.grade ?? "A",
      }));
    }
    if (initial) {
      const rows: WinnerRowState[] = [];
      if (initial[1]) rows.push({ id: "w-1", position: 1, winnerId: initial[1].winnerId, grade: initial[1].grade ?? "A" });
      if (initial[2]) rows.push({ id: "w-2", position: 2, winnerId: initial[2].winnerId, grade: initial[2].grade ?? "A" });
      if (initial[3]) rows.push({ id: "w-3", position: 3, winnerId: initial[3].winnerId, grade: initial[3].grade ?? "A" });
      if (rows.length > 0) return rows;
    }
    return [
      { id: "row-1", position: 1, winnerId: initial?.[1]?.winnerId ?? "", grade: initial?.[1]?.grade ?? "A" },
      { id: "row-2", position: 2, winnerId: initial?.[2]?.winnerId ?? "", grade: initial?.[2]?.grade ?? "A" },
      { id: "row-3", position: 3, winnerId: initial?.[3]?.winnerId ?? "", grade: initial?.[3]?.grade ?? "A" },
    ];
  });

  const [penaltyRows, setPenaltyRows] = useState<
    {
      id: string;
      defaultTarget?: string;
      defaultPoints?: number;
      type?: "student" | "team";
    }[]
  >(() => {
    if (initialPenalties?.length) {
      return initialPenalties.map((penalty, index) => ({
        id: `penalty-${index}`,
        defaultTarget: penalty.targetId,
        defaultPoints: typeof penalty.points === "number" ? penalty.points : 5,
        type: penalty.type,
      }));
    }
    return [];
  });

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === programId) ?? programs[0],
    [programId, programs],
  );

  // Reset winners when program changes
  useEffect(() => {
    setWinnerRows([
      { id: "row-1", position: 1, winnerId: initial?.[1]?.winnerId ?? "", grade: initial?.[1]?.grade ?? "A" },
      { id: "row-2", position: 2, winnerId: initial?.[2]?.winnerId ?? "", grade: initial?.[2]?.grade ?? "A" },
      { id: "row-3", position: 3, winnerId: initial?.[3]?.winnerId ?? "", grade: initial?.[3]?.grade ?? "A" },
    ]);
    setDuplicateError("");
  }, [programId, initial]);

  const programOptions = useMemo(
    () =>
      programs.map((program) => ({
        value: program.id,
        label: program.name,
        meta: `${program.section} · Cat ${program.category}${
          program.stage ? " · On stage" : " · Off stage"
        }`,
      })),
    [programs],
  );

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id,
        label: student.name,
        meta: `Chest ${student.chest_no}`,
      })),
    [students],
  );

  const teamOptions = useMemo(
    () =>
      teams.map((team) => ({
        value: team.id,
        label: team.name,
        meta: team.leader ? `Leader · ${team.leader}` : undefined,
      })),
    [teams],
  );

  const registrationMap = useMemo(() => {
    const map = new Map<string, ProgramRegistration[]>();
    (registrations ?? []).forEach((registration) => {
      const list = map.get(registration.programId) ?? [];
      list.push(registration);
      map.set(registration.programId, list);
    });
    return map;
  }, [registrations]);

  const isSingle = selectedProgram?.section === "single";
  const isJuryMode = mode === "jury";
  const activeJury = juries[0];
  const programRegistrations = selectedProgram
    ? registrationMap.get(selectedProgram.id) ?? []
    : [];

  const singleCandidateOptions = programRegistrations.map((registration) => ({
    value: registration.studentId,
    label: `${registration.studentName} · ${registration.studentChest}`,
    meta: registration.teamName,
  }));

  const teamCandidateOptions = Array.from(
    new Map(
      programRegistrations.map((registration) => [
        registration.teamId,
        { value: registration.teamId, label: registration.teamName, meta: registration.programName },
      ]),
    ).values(),
  );

  const registeredOptions = isSingle ? singleCandidateOptions : teamCandidateOptions;
  const placementSelectOptions = registeredOptions;
  const penaltySelectOptions = placementSelectOptions;

  // Add a new winner placement row
  const addWinnerRow = (defaultPos: 1 | 2 | 3 = 1) => {
    setWinnerRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        position: defaultPos,
        winnerId: "",
        grade: "A",
      },
    ]);
  };

  // Remove a winner placement row
  const removeWinnerRow = (id: string) => {
    setWinnerRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Update a winner placement row field
  const updateWinnerRow = (id: string, field: keyof WinnerRowState, value: any) => {
    setWinnerRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    setDuplicateError("");
  };

  const hasPenaltyOptions = penaltySelectOptions.length > 0;
  const penaltyTypeDefault = initialPenalties?.[0]?.type ?? (isSingle ? "student" : "team");
  const penaltyRowIds = penaltyRows.map((row) => row.id);

  const addPenaltyRow = () => {
    setPenaltyRows((rows) => [
      ...rows,
      {
        id: `penalty-${Math.random().toString(36).slice(2, 9)}`,
        defaultPoints: 5,
      },
    ]);
  };

  const removePenaltyRow = (rowId: string) => {
    setPenaltyRows((rows) => rows.filter((row) => row.id !== rowId));
  };

  const hasEligibleCandidates = placementSelectOptions.length > 0;
  const showProgramSelector = !(isJuryMode && lockProgram);

  const isProgramPublished = useMemo(() => {
    if (!programId || approvedResults.length === 0) return false;
    return approvedResults.some((result) => result.program_id === programId);
  }, [programId, approvedResults]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDuplicateError("");

    if (isProgramPublished) {
      setShowPublishedModal(true);
      return;
    }

    if (winnerRows.length === 0) {
      setDuplicateError("Please add at least one placement field.");
      return;
    }

    const selectedWinnerIds = winnerRows.map((r) => r.winnerId).filter(Boolean);
    if (selectedWinnerIds.length < winnerRows.length) {
      setDuplicateError("Please select candidates for all placement fields.");
      return;
    }

    const uniqueWinners = new Set(selectedWinnerIds);
    if (uniqueWinners.size !== selectedWinnerIds.length) {
      setDuplicateError("Each placement must have a different candidate. Duplicate candidates detected.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    try {
      await action(formData);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("Program already published") || errorMessage.includes("already published")) {
        setShowPublishedModal(true);
        return;
      }
      throw error;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="program_id" value={selectedProgram?.id} />
        {isJuryMode && <input type="hidden" name="jury_id" value={activeJury?.id ?? ""} />}
        <input type="hidden" name="winner_rows" value={winnerRows.map((r) => r.id).join(",")} />

        {showProgramSelector && (
          <Card>
            <Badge tone="cyan">Step 1 · Program</Badge>
            <CardTitle className="mt-4">
              {isJuryMode && lockProgram ? "Program locked in" : "Select a program"}
            </CardTitle>
            <CardDescription className="mt-2">
              {isJuryMode && lockProgram
                ? "Admins have assigned this program to you. Review the details before entering results."
                : "We auto-fill stage, section, and scoring rules."}
            </CardDescription>
            <div className="mt-6">
              {isJuryMode && lockProgram ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Program</p>
                  <p className="text-2xl font-semibold text-white">{selectedProgram?.name}</p>
                </div>
              ) : (
                <SearchSelect
                  name="program_selector"
                  options={programOptions}
                  value={programId}
                  onValueChange={(next) => setProgramId(next)}
                  disabled={lockProgram}
                  placeholder="Search program..."
                />
              )}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p>Section: {selectedProgram?.section}</p>
              <p>Stage: {selectedProgram?.stage ? "On stage" : "Off stage"}</p>
              <p>Category: {selectedProgram?.category}</p>
            </div>
          </Card>
        )}

        <Card>
          <Badge tone="pink">Step 2 · Winners & Placements</Badge>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Add podium placements</CardTitle>
              <CardDescription className="mt-2">
                Select {isSingle ? "students" : "teams"} for placements. You can add extra positions for ties or remove fields.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRules(true)}
            >
              View scoring matrix
            </Button>
          </div>

          {!hasEligibleCandidates && (
            <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              No registered candidates for this program yet.
            </p>
          )}

          {duplicateError && (
            <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {duplicateError}
            </p>
          )}

          {/* Dynamic Winner Placement Fields */}
          <div className="mt-6 grid gap-5">
            {winnerRows.map((row, idx) => {
              // Exclude candidates already selected in OTHER rows
              const otherSelectedIds = winnerRows
                .filter((r) => r.id !== row.id && r.winnerId)
                .map((r) => r.winnerId);

              const availableOptions = placementSelectOptions.filter(
                (opt) => !otherSelectedIds.includes(opt.value)
              );

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 relative"
                >
                  <input type="hidden" name={`position_${row.id}`} value={row.position} />

                  {/* Also emit legacy inputs winner_1, winner_2, winner_3 if available */}
                  {idx < 3 && (
                    <>
                      <input type="hidden" name={`winner_${idx + 1}`} value={row.winnerId} />
                      <input type="hidden" name={`grade_${idx + 1}`} value={row.grade} />
                    </>
                  )}

                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-48">
                        <SearchSelect
                          name={`position_select_${row.id}`}
                          options={positionOptions}
                          value={String(row.position)}
                          onValueChange={(val) =>
                            updateWinnerRow(row.id, "position", Number(val) as 1 | 2 | 3)
                          }
                          disabled={!hasEligibleCandidates}
                        />
                      </div>
                      <Badge tone={row.position === 1 ? "amber" : row.position === 2 ? "cyan" : "pink"}>
                        {row.position === 1 ? "1st Place 🥇" : row.position === 2 ? "2nd Place 🥈" : "3rd Place 🥉"}
                      </Badge>
                    </div>

                    {winnerRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1 text-xs"
                        onClick={() => removeWinnerRow(row.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Field
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Select Candidate</p>
                      <SearchSelect
                        name={`winner_${row.id}`}
                        required
                        value={row.winnerId}
                        onValueChange={(value) => updateWinnerRow(row.id, "winnerId", value)}
                        options={availableOptions}
                        placeholder={`Search ${isSingle ? "student" : "team"}...`}
                        disabled={!hasEligibleCandidates}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Grade Bonus</p>
                      <SearchSelect
                        name={`grade_${row.id}`}
                        value={row.grade}
                        onValueChange={(value) => updateWinnerRow(row.id, "grade", value as GradeType)}
                        disabled={!hasEligibleCandidates}
                        options={gradeOptions}
                        placeholder="Select grade"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Placement Row Button */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => addWinnerRow(1)}
              disabled={!hasEligibleCandidates}
            >
              <Plus className="w-4 h-4" /> Add 1st Place Field (Tie)
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => addWinnerRow(2)}
              disabled={!hasEligibleCandidates}
            >
              <Plus className="w-4 h-4" /> Add 2nd Place Field
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => addWinnerRow(3)}
              disabled={!hasEligibleCandidates}
            >
              <Plus className="w-4 h-4" /> Add 3rd Place Field
            </Button>
          </div>

          {isJuryMode && !showProgramSelector && (
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-widest text-white/50">Logged in as</p>
              <p className="text-lg font-semibold text-white">{juryName ?? activeJury?.name}</p>
              <p className="text-xs text-white/50">
                Double-check placements before submitting — edits aren’t possible afterward.
              </p>
              <Button type="submit" className="mt-2 w-full" disabled={!hasEligibleCandidates}>
                Submit evaluation
              </Button>
            </div>
          )}
        </Card>

        <input type="hidden" name="penalty_rows" value={penaltyRowIds.join(",")} />
        {penaltyRows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-white/80">Need to deduct points for a no-show?</p>
            <Button
              type="button"
              variant="secondary"
              onClick={addPenaltyRow}
              disabled={!hasPenaltyOptions}
            >
              Add penalty
            </Button>
          </div>
        ) : (
          <Card>
            <Badge tone="amber">Optional · Minus Points</Badge>
            <CardTitle className="mt-4">No-show penalty</CardTitle>
            <CardDescription className="mt-2">
              Apply a deduction when a {isSingle ? "registered participant" : "team"} fails to appear.
              Leave blank to skip.
            </CardDescription>
            <div className="mt-6 space-y-4">
              {penaltyRows.map((row) => {
                const rowType = row.type ?? penaltyTypeDefault;
                return (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <input type="hidden" name={`penalty_type_${row.id}`} value={rowType} />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="flex-1">
                        <SearchSelect
                          name={`penalty_target_${row.id}`}
                          options={penaltySelectOptions}
                          placeholder={`Select a ${isSingle ? "participant" : "team"} to penalize`}
                          defaultValue={row.defaultTarget ?? ""}
                          disabled={!hasPenaltyOptions}
                        />
                      </div>
                      <div className="flex items-center gap-3 md:w-60">
                        <Input
                          name={`penalty_points_${row.id}`}
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Penalty points"
                          defaultValue={row.defaultPoints ?? 5}
                          disabled={!hasPenaltyOptions}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-xs text-white/80"
                          onClick={() => removePenaltyRow(row.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={addPenaltyRow}
                disabled={!hasPenaltyOptions}
              >
                Add penalty
              </Button>
            </div>
            <p className="mt-3 text-xs text-white/50">
              Enter the number of points to deduct. Each entry reduces the team total only.
            </p>
          </Card>
        )}

        {!isJuryMode && (
          <Card>
            <Badge tone="emerald">Step 3 · Submit</Badge>
            <CardTitle className="mt-4">Assign responsible jury (Optional)</CardTitle>
            <CardDescription className="mt-2">
              {defaultJuryId
                ? "Leave blank to assign to Admin. Once you submit, the record lands in Pending Results for approval."
                : "Once you submit, the record lands in Pending Results for approval."}
            </CardDescription>
            {defaultJuryId && <input type="hidden" name="default_jury_id" value={defaultJuryId} />}
            <SearchSelect
              className="mt-6"
              name="jury_id"
              defaultValue={defaultJuryId ?? juries[0]?.id}
              disabled={lockProgram}
              options={juries.map((jury) => ({ value: jury.id, label: jury.name }))}
              placeholder="Select jury (defaults to Admin if not selected)"
            />
            <Button type="submit" className="mt-4" disabled={!hasEligibleCandidates}>
              {submitLabel}
            </Button>
          </Card>
        )}

        {/* Scoring Matrix Modal */}
        <Modal
          open={showRules}
          onClose={() => setShowRules(false)}
          title="Scoring Matrix"
          actions={
            <Button type="button" variant="secondary" onClick={() => setShowRules(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-sm">
            <p>Single events add grade bonus on top of podium points.</p>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="font-semibold text-white">Single · Podium</p>
              <p className="text-xs text-white/70">ALL CATEGORIES: 10 / 6 / 2</p>
              <p className="font-semibold text-white">Grade Bonus</p>
              <p className="text-emerald-400 font-bold">A +10 · B +6 · C +2</p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="font-semibold text-white">Single Items</p>
              <p>1st 10 · 2nd 6 · 3rd 2</p>
              <p className="font-semibold text-white">Group Items</p>
              <p className="text-amber-400 font-bold">1st 20 · 2nd 10 · 3rd 6</p>
              <p className="font-semibold text-white">General Items</p>
              <p className="text-amber-400 font-bold">1st 20 · 2nd 10 · 3rd 6</p>
            </div>
          </div>
        </Modal>

        {/* Published Program Modal */}
        <Modal
          open={showPublishedModal}
          onClose={() => setShowPublishedModal(false)}
          title="Program Already Published"
          actions={
            <Button type="button" variant="secondary" onClick={() => setShowPublishedModal(false)}>
              Close
            </Button>
          }
        >
          <p className="text-white/90">This program is already published.</p>
        </Modal>
      </form>
    </>
  );
}
