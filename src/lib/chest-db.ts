import { connectDB } from "./db";
import { StudentModel, TeamModel, ProgramRegistrationModel, ReplacementRequestModel, ChestCounterModel } from "./models";
import { getTeamPrefix, formatChestNumber, parseChestNumber } from "./chest-utils";

/**
 * Database-backed next chest number generator.
 * Respects ChestCounterModel to ensure numbers are NEVER reused even after deletion.
 */
export async function getNextChestNumberDB(
  teamId: string,
  teamName: string,
  gender: "boy" | "girl"
): Promise<string> {
  await connectDB();
  const targetPrefix = getTeamPrefix(teamName, gender);

  // Query existing students for this team and gender
  const students = await StudentModel.find({ team_id: teamId }).lean();
  let maxExistingNumber = 0;

  for (const student of students) {
    const chest = (student.chest_no || "").trim().toUpperCase();
    const studentGender = student.gender || (gender as string);

    // If chest starts with prefix or student is of target gender
    if (chest.startsWith(targetPrefix) || studentGender === gender) {
      const parsed = parseChestNumber(chest);
      if (parsed && parsed.number > maxExistingNumber) {
        maxExistingNumber = parsed.number;
      }
    }
  }

  // Query ChestCounterModel
  const counter = await ChestCounterModel.findOne({ team_id: teamId, gender }).lean();
  const lastNumberInCounter = counter?.last_number || 0;

  const highestAssigned = Math.max(lastNumberInCounter, maxExistingNumber);
  const nextNumber = highestAssigned + 1;

  return formatChestNumber(targetPrefix, nextNumber);
}

/**
 * Updates chest counter in database when a chest number is assigned.
 */
export async function updateChestCounterDB(
  teamId: string,
  gender: "boy" | "girl",
  assignedNumber: number
): Promise<void> {
  await connectDB();
  await ChestCounterModel.updateOne(
    { team_id: teamId, gender },
    { $max: { last_number: assignedNumber } },
    { upsert: true }
  );
}

/**
 * Migration flag to avoid redundant executions per process lifetime.
 */
let hasMigrated = false;

/**
 * Migrates existing student chest numbers in the database to the new Team+Gender format (e.g. RB-001, RG-001).
 * Idempotent: safe to call on startup.
 */
export async function migrateChestNumbers(): Promise<void> {
  if (hasMigrated) return;

  try {
    await connectDB();
    const teams = await TeamModel.find().lean();
    if (!teams.length) return;

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const students = await StudentModel.find().lean();
    if (!students.length) {
      hasMigrated = true;
      return;
    }

    // Check if any student needs migration (e.g., chest_no does not match prefix format like RB-001)
    const validChestPattern = /^[A-Z][BG]-\d{3,}$/;
    const needsMigration = students.some((s) => !validChestPattern.test((s.chest_no || "").trim().toUpperCase()));

    // Always ensure counters exist in ChestCounterModel even if students are already formatted
    for (const team of teams) {
      for (const gender of ["boy", "girl"] as const) {
        const prefix = getTeamPrefix(team.name, gender);
        const teamGenderStudents = students.filter((s) => {
          if (s.team_id !== team.id) return false;
          const g = s.gender || (team.gender === "girls" ? "girl" : "boy");
          return g === gender;
        });

        let maxNum = 0;
        for (const s of teamGenderStudents) {
          const parsed = parseChestNumber(s.chest_no || "");
          if (parsed && parsed.number > maxNum) {
            maxNum = parsed.number;
          }
        }

        if (maxNum > 0) {
          await ChestCounterModel.updateOne(
            { team_id: team.id, gender },
            { $max: { last_number: maxNum } },
            { upsert: true }
          );
        }
      }
    }

    if (!needsMigration) {
      hasMigrated = true;
      return;
    }

    console.log("🔄 Migrating existing student chest numbers to new Team+Gender format...");

    // Group students by team_id and gender
    const groups = new Map<string, typeof students>();

    for (const student of students) {
      const team = teamMap.get(student.team_id);
      let gender: "boy" | "girl" = "boy";

      if (student.gender === "boy" || student.gender === "girl") {
        gender = student.gender;
      } else if (team?.gender === "girls") {
        gender = "girl";
      } else if (team?.gender === "boys") {
        gender = "boy";
      }

      const key = `${student.team_id}_${gender}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(student);
    }

    for (const [key, groupStudents] of groups.entries()) {
      const [teamId, gender] = key.split("_") as [string, "boy" | "girl"];
      const team = teamMap.get(teamId);
      const teamName = team ? team.name : "Team";
      const prefix = getTeamPrefix(teamName, gender);

      // Check existing valid chest numbers to avoid collision
      const alreadyValid = groupStudents.filter((s) => validChestPattern.test((s.chest_no || "").trim().toUpperCase()));
      const validNumbers = alreadyValid
        .map((s) => parseChestNumber(s.chest_no)?.number || 0)
        .filter((n) => n > 0);

      let currentCounter = validNumbers.length > 0 ? Math.max(...validNumbers) : 0;

      // Filter students needing conversion
      const toConvert = groupStudents.filter((s) => !validChestPattern.test((s.chest_no || "").trim().toUpperCase()));
      
      // Sort toConvert by old chest number or ID for deterministic ordering
      toConvert.sort((a, b) => (a.chest_no || "").localeCompare(b.chest_no || ""));

      for (const student of toConvert) {
        currentCounter++;
        const newChestNo = formatChestNumber(prefix, currentCounter);

        // Update Student
        await StudentModel.updateOne(
          { id: student.id },
          { $set: { chest_no: newChestNo, gender } }
        );

        // Update ProgramRegistration
        await ProgramRegistrationModel.updateMany(
          { studentId: student.id },
          { $set: { studentChest: newChestNo } }
        );

        // Update ReplacementRequest
        await ReplacementRequestModel.updateMany(
          { oldStudentId: student.id },
          { $set: { oldStudentChest: newChestNo } }
        );
        await ReplacementRequestModel.updateMany(
          { newStudentId: student.id },
          { $set: { newStudentChest: newChestNo } }
        );
      }

      const highestNumber = Math.max(
        currentCounter,
        ...(validNumbers.length ? validNumbers : [0])
      );

      if (highestNumber > 0) {
        await ChestCounterModel.updateOne(
          { team_id: teamId, gender },
          { $set: { last_number: highestNumber } },
          { upsert: true }
        );
      }
    }

    console.log("✅ Chest number migration completed successfully.");
    hasMigrated = true;
  } catch (error) {
    console.error("❌ Chest number migration failed:", error);
  }
}
