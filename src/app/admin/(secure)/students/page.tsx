import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Button, SubmitButton } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/ui/search-select";
import { StudentManager } from "@/components/student-manager";
import { Download } from "lucide-react";
import {
  createStudent,
  deleteStudentById,
  getStudents,
  getTeams,
  getPrograms,
  updateStudentById,
} from "@/lib/data";
import { getProgramRegistrations } from "@/lib/team-data";
import { redirectWithToast } from "@/lib/actions";

import { generateNextChestNumberSync } from "@/lib/chest-utils";
import { getNextChestNumberDB } from "@/lib/chest-db";

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  team_id: z.string().min(2),
  chest_no: z.string().optional(),
  gender: z.enum(["boy", "girl"]).optional(),
  category: z.enum(["KIDDIES", "SUB-JUNIOR", "JUNIOR", "SENIOR", "SUPER-SENIOR", "GENERAL", "none"]).optional(),
});

const csvStudentSchema = z.object({
  name: z.string().min(2, "Student name is required"),
  team_id: z.string().min(2).optional(),
  team_name: z.string().min(2).optional(),
  chest_no: z.string().optional(),
  gender: z.string().optional(),
  category: z.string().optional(),
}).refine((data) => data.team_id || data.team_name, {
  message: "Either team_id or team_name is required",
  path: ["team_id"],
});

async function upsertStudent(formData: FormData, mode: "create" | "update") {
  const genderRaw = String(formData.get("gender") ?? "").trim().toLowerCase();
  const gender = genderRaw === "boy" || genderRaw === "girl" ? (genderRaw as "boy" | "girl") : undefined;

  const categoryRaw = String(formData.get("category") ?? "").trim().toUpperCase();
  const validCategories = ["KIDDIES", "SUB-JUNIOR", "JUNIOR", "SENIOR", "SUPER-SENIOR", "GENERAL", "none"];
  const category = validCategories.includes(categoryRaw) ? (categoryRaw as import("@/lib/types").CategoryType) : undefined;

  const parsed = studentSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim(),
    team_id: String(formData.get("team_id") ?? "").trim(),
    chest_no: String(formData.get("chest_no") ?? "").trim() || undefined,
    gender,
    category,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }
  const payload = parsed.data;

  let chest_no = payload.chest_no;
  const teams = await getTeams();
  const team = teams.find((t) => t.id === payload.team_id);
  if (!team) {
    throw new Error("Team not found");
  }
  const genderToUse = payload.gender || (team.gender === "girls" ? "girl" : "boy");

  if (mode === "create" && !chest_no) {
    chest_no = await getNextChestNumberDB(team.id, team.name, genderToUse);
  } else if (mode === "update" && !chest_no) {
    const students = await getStudents();
    const current = students.find((s) => s.id === payload.id);
    if (!current) {
      throw new Error("Student not found");
    }
    chest_no = current.chest_no;
  }

  if (mode === "create") {
    await createStudent({
      name: payload.name,
      team_id: payload.team_id,
      chest_no: chest_no!,
      gender: genderToUse,
      category: payload.category,
    });
  } else {
    if (!payload.id) throw new Error("Student ID missing");
    await updateStudentById(payload.id, {
      name: payload.name,
      team_id: payload.team_id,
      chest_no: chest_no!,
      gender: genderToUse,
      category: payload.category,
    });
  }

  revalidatePath("/admin/students");
}

async function deleteStudentAction(formData: FormData) {
  "use server";
  try {
    const id = String(formData.get("id") ?? "");
    await deleteStudentById(id);
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", "Student deleted successfully!", "error");
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", error?.message || "Failed to delete student", "error");
  }
}

async function bulkDeleteStudentsAction(formData: FormData) {
  "use server";
  try {
    const ids = String(formData.get("student_ids") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", "No students selected for deletion.", "error");
      return;
    }
    for (const id of ids) {
      await deleteStudentById(id);
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", `Successfully deleted ${ids.length} student(s)!`, "error");
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", error?.message || "Failed to delete students", "error");
  }
}

async function createStudentAction(formData: FormData) {
  "use server";
  try {
    await upsertStudent(formData, "create");
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", "Student created successfully!", "success");
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", error?.message || "Failed to create student", "error");
  }
}

async function updateStudentAction(formData: FormData) {
  "use server";
  try {
    await upsertStudent(formData, "update");
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", "Student updated successfully!", "success");
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", error?.message || "Failed to update student", "error");
  }
}

function parseStudentCsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const [headerLine, ...rows] = lines;
  const headers = headerLine
    .split(",")
    .map((header) => header.trim().toLowerCase());
  
  // Accept either team_id or team_name
  const hasTeamId = headers.includes("team_id");
  const hasTeamName = headers.includes("team_name");
  
  if (!hasTeamId && !hasTeamName) {
    throw new Error('Missing "team_id" or "team_name" column in CSV header.');
  }
  
  const requiredHeaders = ["name"];
  if (hasTeamId) requiredHeaders.push("team_id");
  if (hasTeamName) requiredHeaders.push("team_name");
  
  for (const column of requiredHeaders) {
    if (!headers.includes(column)) {
      throw new Error(`Missing "${column}" column in CSV header.`);
    }
  }
  const indexes = requiredHeaders.map((column) => headers.indexOf(column));
  return rows.map((row, index) => {
    const cells = row.split(",").map((cell) => cell.trim());
    if (cells.length < headers.length) {
      throw new Error(`Row ${index + 2} is incomplete.`);
    }
    const data = Object.fromEntries(
      requiredHeaders.map((column, idx) => [column, cells[indexes[idx]] ?? ""]),
    );
    return { row: index + 2, data };
  });
}

async function importStudentsAction(formData: FormData) {
  "use server";
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", "Please upload a CSV file.", "error");
      return;
    }
    const text = await file.text();
    const entries = parseStudentCsv(text);
    if (entries.length === 0) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", "CSV file does not contain any data rows.", "error");
      return;
    }
  const teams = await getTeams();
  const teamIds = new Set(teams.map((team) => team.id));
  const teamNameToId = new Map(teams.map((team) => [team.name.toUpperCase(), team.id]));
  
  // Get all existing students once to check for duplicates
  const existingStudents = await getStudents();
  const existingChestNumbers = new Set(
    existingStudents.map((s) => s.chest_no.trim().toUpperCase())
  );
  
  // Track chest numbers within this import batch to prevent duplicates in the same CSV
  const importBatchChestNumbers = new Set<string>();
  
  for (const entry of entries) {
    // Skip empty rows
    if (!entry.data.name || !entry.data.name.trim()) {
      continue;
    }
    
    const parsed = csvStudentSchema.safeParse(entry.data);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(", ");
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: ${message}`, "error");
      return;
    }
    
    // Resolve team_id: check if provided value is a valid team_id, otherwise treat as team_name
    let resolvedTeamId = parsed.data.team_id;
    
    // If team_id is provided but not found in valid IDs, try treating it as a team name
    if (resolvedTeamId && !teamIds.has(resolvedTeamId)) {
      const teamNameUpper = resolvedTeamId.toUpperCase();
      const foundId = teamNameToId.get(teamNameUpper);
      if (foundId) {
        resolvedTeamId = foundId;
      }
    }
    
    // If still no team_id, try team_name field
    if (!resolvedTeamId && parsed.data.team_name) {
      const teamNameUpper = parsed.data.team_name.toUpperCase();
      resolvedTeamId = teamNameToId.get(teamNameUpper);
    }
    
    if (!resolvedTeamId) {
      const providedValue = parsed.data.team_id || parsed.data.team_name || "";
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: Team "${providedValue}" not found. Available teams: ${Array.from(teamNameToId.keys()).join(", ")}`, "error");
      return;
    }
    
    const team = teams.find((t) => t.id === resolvedTeamId);
    if (!team) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: Team not found`, "error");
      return;
    }
    
    let gender: "boy" | "girl" | undefined = undefined;
    const genderRaw = parsed.data.gender?.trim().toLowerCase();
    if (genderRaw === "boy" || genderRaw === "girl" || genderRaw === "male" || genderRaw === "female") {
      gender = (genderRaw === "boy" || genderRaw === "male") ? "boy" : "girl";
    } else if (team.gender === "girls") {
      gender = "girl";
    } else if (team.gender === "boys") {
      gender = "boy";
    } else {
      gender = "boy";
    }

    // Generate or use provided chest number, normalized to uppercase
    const chest_no = parsed.data.chest_no?.trim().toUpperCase() || generateNextChestNumberSync(team.name, gender, existingStudents);
    
    // Check for duplicate chest number in existing database
    if (existingChestNumbers.has(chest_no)) {
      const existingStudent = existingStudents.find((s) => s.chest_no.toUpperCase() === chest_no);
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: Chest number "${chest_no}" already exists in database (assigned to "${existingStudent?.name || "unknown student"}").`, "error");
      return;
    }
    
    // Check for duplicate chest number within this import batch
    if (importBatchChestNumbers.has(chest_no)) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: Chest number "${chest_no}" is duplicated within this CSV file. Each chest number must be unique.`, "error");
      return;
    }
    
    // Add to batch tracking
    importBatchChestNumbers.add(chest_no);

    let category: import("@/lib/types").CategoryType | undefined = undefined;
    const categoryRaw = parsed.data.category?.trim().toUpperCase();
    const validCategories = ["KIDDIES", "SUB-JUNIOR", "JUNIOR", "SENIOR", "SUPER-SENIOR", "GENERAL", "none"];
    if (categoryRaw && validCategories.includes(categoryRaw)) {
      category = categoryRaw as import("@/lib/types").CategoryType;
    }
    
    try {
      await createStudent({
        name: parsed.data.name,
        team_id: resolvedTeamId,
        chest_no,
        gender,
        category,
      });
      
      // Add to existing set and array to prevent duplicates in subsequent rows of the same import
      existingChestNumbers.add(chest_no);
      existingStudents.push({
        id: `batch_${entry.row}`,
        name: parsed.data.name,
        team_id: resolvedTeamId,
        chest_no,
        total_points: 0,
        gender,
      });
    } catch (error: any) {
      // Provide user-friendly error message
      if (error.message.includes("Chest number")) {
        revalidatePath("/admin/students");
        redirectWithToast("/admin/students", `Row ${entry.row}: ${error.message}`, "error");
        return;
      }
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", `Row ${entry.row}: Failed to create student - ${error.message}`, "error");
      return;
    }
  }
  revalidatePath("/admin/students");
  redirectWithToast("/admin/students", `Successfully imported ${importBatchChestNumbers.size} student(s)!`, "success");
  } catch (error: any) {
    if (error?.digest === "NEXT_REDIRECT" || error?.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Handle CSV parsing errors
    if (error.message.includes("Missing") || error.message.includes("incomplete") || error.message.includes("Row")) {
      revalidatePath("/admin/students");
      redirectWithToast("/admin/students", error.message, "error");
      return;
    }
    revalidatePath("/admin/students");
    redirectWithToast("/admin/students", error?.message || "Failed to import students", "error");
  }
}

export default async function StudentsPage() {
  const [students, teams, programs, registrations] = await Promise.all([
    getStudents(),
    getTeams(),
    getPrograms(),
    getProgramRegistrations(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
      <Card className="h-full">
        <CardTitle>Add Student</CardTitle>
        <CardDescription className="mt-2">
          Maintain a searchable roster for quick result entry.
        </CardDescription>
        <form
          action={createStudentAction}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">Student Name</label>
            <Input name="name" placeholder="Student name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">Select Team</label>
            <SearchSelect
              name="team_id"
              defaultValue={teams[0]?.id}
              required
              options={teams.map((team) => ({
                value: team.id,
                label: team.gender && team.gender !== "mixed"
                  ? `${team.name} (${team.gender === "boys" ? "Boys" : "Girls"})`
                  : team.name,
              }))}
              placeholder="Select team"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">Gender</label>
            <select
              name="gender"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            >
              <option value="" className="bg-slate-900 text-white">Select Gender</option>
              <option value="boy" className="bg-slate-900 text-white">Boy</option>
              <option value="girl" className="bg-slate-900 text-white">Girl</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">Category</label>
            <select
              name="category"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            >
              <option value="none" className="bg-slate-900 text-white">General / None</option>
              <option value="KIDDIES" className="bg-slate-900 text-white">KIDDIES</option>
              <option value="SUB-JUNIOR" className="bg-slate-900 text-white">SUB-JUNIOR</option>
              <option value="JUNIOR" className="bg-slate-900 text-white">JUNIOR</option>
              <option value="SENIOR" className="bg-slate-900 text-white">SENIOR</option>
              <option value="SUPER-SENIOR" className="bg-slate-900 text-white">SUPER-SENIOR</option>
              <option value="GENERAL" className="bg-slate-900 text-white">GENERAL</option>
            </select>
          </div>
          <SubmitButton className="md:col-span-2">
            Save Student
          </SubmitButton>
        </form>
        <p className="mt-2 text-xs text-white/60">
          Chest number will be auto-generated based on team name (e.g., {teams[0]?.name ? teams[0].name.slice(0, 2).toUpperCase() : "TM"}001)
        </p>
      </Card>
      <Card className="h-full flex flex-col justify-between">
        <div>
          <CardTitle>Bulk Import Students (CSV)</CardTitle>
          <CardDescription className="mt-2">
            Required columns: <code>name</code> and either <code>team_id</code> or <code>team_name</code>.
            <br />
            Optional columns: <code>gender</code> (boy/girl), <code>category</code> (KIDDIES, SUB-JUNIOR, etc.), and <code>chest_no</code>.
            <br />
            <span className="text-xs text-white/50 block mt-1">
              <strong>Example Format:</strong>
              <code className="block mt-1 p-2 bg-black/30 rounded text-cyan-300 font-mono text-[11px] whitespace-pre">
                {`name,team_name,gender,category,chest_no\nMuhammed Anshid,Thazmiyya,boy,SUB-JUNIOR,TH033\nAisha Mariyam,Razmiyya,girl,JUNIOR,RA045`}
              </code>
            </span>
          </CardDescription>
        </div>
        <div>
          <div className="mt-4">
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                "name,team_name,gender,category,chest_no\nMuhammed Anshid,Thazmiyya,boy,SUB-JUNIOR,TH033\nAisha Mariyam,Razmiyya,girl,JUNIOR,RA045\n"
              )}`}
              download="students_import_template.csv"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors bg-fuchsia-500/10 border border-fuchsia-500/20 px-3.5 py-2 rounded-xl"
            >
              <Download className="h-3.5 w-3.5" />
              Download Sample CSV Template
            </a>
          </div>
          <form
            action={importStudentsAction}
            className="mt-4 flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="flex-1">
              <label className="text-sm font-semibold text-white/70">
                CSV File
              </label>
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </div>
            <SubmitButton>Import CSV</SubmitButton>
          </form>
        </div>
      </Card>
      </div>

      <StudentManager
        students={students}
        teams={teams}
        programs={programs}
        registrations={registrations}
        updateAction={updateStudentAction}
        deleteAction={deleteStudentAction}
        bulkDeleteAction={bulkDeleteStudentsAction}
      />
    </div>
  );
}


