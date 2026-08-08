export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { AddResultForm } from "@/components/forms/add-result-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getApprovedResults, getPendingResults, getJuries, getPrograms, getStudents, getTeams, getOrCreateAdminJury } from "@/lib/data";
import { getProgramRegistrations } from "@/lib/team-data";
import { ensureRegisteredCandidates } from "@/lib/registration-guard";
import { submitResultToPending } from "@/lib/result-service";
import { redirectWithToast } from "@/lib/actions";
import { revalidatePath } from "next/cache";
import type { Program } from "@/lib/types";

type PenaltyFormPayload = {
  id: string;
  type: "student" | "team";
  points: number;
};

function parsePenaltyPayloads(formData: FormData): PenaltyFormPayload[] {
  const rowValue = String(formData.get("penalty_rows") ?? "");
  const rowIds = rowValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return rowIds
    .map((rowId) => {
      const target = String(formData.get(`penalty_target_${rowId}`) ?? "").trim();
      const type = String(formData.get(`penalty_type_${rowId}`) ?? "").trim();
      const pointsRaw = String(formData.get(`penalty_points_${rowId}`) ?? "").trim();
      const points = pointsRaw ? Math.abs(Number(pointsRaw)) : 0;
      if (!target || points <= 0 || (type !== "student" && type !== "team") || Number.isNaN(points)) {
        return null;
      }
      return {
        id: target,
        type,
        points,
      } satisfies PenaltyFormPayload;
    })
    .filter((penalty): penalty is PenaltyFormPayload => Boolean(penalty));
}

async function submitResultAction(formData: FormData) {
  "use server";
  try {
    const programId = String(formData.get("program_id") ?? "");
    let juryId = String(formData.get("jury_id") ?? "").trim();
    
    // If no jury is selected, default to admin jury
    if (!juryId) {
      // Try to get from hidden field first, otherwise create/fetch admin jury
      const defaultJuryId = String(formData.get("default_jury_id") ?? "").trim();
      if (defaultJuryId) {
        juryId = defaultJuryId;
      } else {
        const adminJury = await getOrCreateAdminJury();
        juryId = adminJury.id;
      }
    }

    // Collect winners dynamically from form data
    const rowValue = String(formData.get("winner_rows") ?? "");
    let rowIds = rowValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (rowIds.length === 0) {
      rowIds = ["1", "2", "3"];
    }

    const winners: { position: 1 | 2 | 3; id: string; grade: "A" | "B" | "C" | "none" }[] = [];
    for (const rowId of rowIds) {
      const value = String(formData.get(`winner_${rowId}`) ?? "").trim();
      const posRaw = Number(formData.get(`position_${rowId}`) ?? rowId);
      const position = (posRaw >= 1 && posRaw <= 3 ? posRaw : 1) as 1 | 2 | 3;
      const grade = (formData.get(`grade_${rowId}`) ?? "none") as "A" | "B" | "C" | "none";

      if (value) {
        winners.push({ position, id: value, grade });
      }
    }

    if (winners.length === 0) {
      redirectWithToast("/admin/add-result", "At least one placement is required", "error");
      return;
    }

    // Validate that candidates are distinct
    const winnerIds = winners.map((w) => w.id);
    const uniqueWinnerIds = new Set(winnerIds);
    if (uniqueWinnerIds.size !== winnerIds.length) {
      redirectWithToast("/admin/add-result", "Placements must have different candidates.", "error");
      return;
    }

    const penalties = parsePenaltyPayloads(formData);

    await ensureRegisteredCandidates(programId, [
      ...winners.map((winner) => winner.id),
      ...penalties.map((penalty) => penalty.id),
    ]);

    try {
      await submitResultToPending({
        programId,
        juryId,
        winners,
        penalties,
      });
      revalidatePath("/admin/pending-results");
      revalidatePath("/admin/add-result");
      redirectWithToast("/admin/pending-results", "Result submitted successfully! Waiting for approval.", "success");
    } catch (error: any) {
      // Handle published program error
      if (error.message?.includes("Program already published") || error.message?.includes("already published")) {
        redirectWithToast("/admin/add-result", "Program already published", "error");
        return;
      }
      // Handle duplicate result submission error
      if (error.message?.includes("already exists") || error.message?.includes("already been approved")) {
        redirectWithToast("/admin/add-result", error.message, "error");
        return;
      }
      redirectWithToast("/admin/add-result", `Failed to submit result: ${error.message}`, "error");
    }
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    redirectWithToast("/admin/add-result", error?.message || "Failed to submit result", "error");
  }
}

export default async function AddResultPage() {
  const [programs, students, teams, juries, registrations, approvedResults, pendingResults, adminJury] = await Promise.all([
    getPrograms(),
    getStudents(),
    getTeams(),
    getJuries(),
    getProgramRegistrations(),
    getApprovedResults(),
    getPendingResults(),
    getOrCreateAdminJury(),
  ]);

  // Filter out programs that already have submitted results (approved or pending)
  const submittedProgramIds = new Set([
    ...approvedResults.map((result) => result.program_id),
    ...pendingResults.map((result) => result.program_id),
  ]);

  // Map candidate registration counts per program
  const regCountMap = new Map<string, number>();
  registrations.forEach((reg) => {
    const pId = String(reg.programId);
    regCountMap.set(pId, (regCountMap.get(pId) ?? 0) + 1);
  });

  const unsubmittedPrograms = programs.filter((program) => !submittedProgramIds.has(program.id));

  // Deduplicate unsubmitted programs so each unique program appears once
  const uniqueProgramMap = new Map<string, Program>();
  unsubmittedPrograms.forEach((prog) => {
    const key = `${prog.name.trim().toLowerCase()}_${prog.category}_${prog.section}_${prog.stage}`;
    if (!uniqueProgramMap.has(key)) {
      uniqueProgramMap.set(key, prog);
    }
  });
  const deduplicatedPrograms = Array.from(uniqueProgramMap.values());

  // Sort programs: programs with registered candidates come first (highest candidate count first)
  const availablePrograms = [...deduplicatedPrograms].sort((a, b) => {
    const countA = regCountMap.get(String(a.id)) ?? 0;
    const countB = regCountMap.get(String(b.id)) ?? 0;
    if (countA !== countB) {
      return countB - countA;
    }
    return a.name.localeCompare(b.name);
  });

  if (availablePrograms.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Add result (3 steps)</h1>
        <Card className="border-amber-500/40 bg-amber-500/10 p-6">
          <CardTitle>No Programs Available</CardTitle>
          <CardDescription className="mt-2">
            All programs have either been published or are currently pending approval.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Add result (3 steps)</h1>
      <AddResultForm
        programs={availablePrograms}
        students={students}
        teams={teams}
        juries={juries}
        registrations={registrations}
        approvedResults={approvedResults}
        action={submitResultAction}
        defaultJuryId={adminJury.id}
      />
    </div>
  );
}

