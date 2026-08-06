import { connectDB } from "./db";
import { StudentModel, TeamModel, ProgramRegistrationModel, ReplacementRequestModel, ChestCounterModel } from "./models";
import { getTeamPrefix, formatChestNumber, parseChestNumber } from "./chest-utils";

/**
 * Database-backed next chest number generator.
 * Calculates next number based on max existing student chest number in the DB.
 */
export async function getNextChestNumberDB(
  teamId: string,
  teamName: string,
  gender: "boy" | "girl"
): Promise<string> {
  await connectDB();
  const targetPrefix = getTeamPrefix(teamName, gender);
  const normalizedTargetPrefix = targetPrefix.replace("-", "");

  // Query existing students for this team matching target prefix
  const students = await StudentModel.find({ team_id: teamId }).lean();
  let maxExistingNumber = 0;

  for (const student of students) {
    const chest = (student.chest_no || "").trim().toUpperCase();
    const parsed = parseChestNumber(chest);
    if (parsed) {
      const studentPrefix = parsed.prefix.replace("-", "");
      if (studentPrefix === normalizedTargetPrefix && parsed.number > maxExistingNumber) {
        maxExistingNumber = parsed.number;
      }
    }
  }

  const nextNumber = maxExistingNumber + 1;

  // Keep counter synchronized with max existing student number
  await updateChestCounterDB(teamId, gender, nextNumber);

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
    { $set: { last_number: assignedNumber } },
    { upsert: true }
  );
}

/**
 * Recalibrates chest counter in database based on actual max student chest number present.
 */
export async function recalibrateChestCounterDB(
  teamId: string,
  gender: "boy" | "girl"
): Promise<number> {
  await connectDB();
  const team = await TeamModel.findOne({ id: teamId }).lean();
  if (!team) return 0;

  const targetPrefix = getTeamPrefix(team.name, gender).replace("-", "");
  const students = await StudentModel.find({ team_id: teamId }).lean();
  let maxNum = 0;

  for (const student of students) {
    const chest = (student.chest_no || "").trim().toUpperCase();
    const parsed = parseChestNumber(chest);
    if (parsed && parsed.prefix.replace("-", "") === targetPrefix) {
      if (parsed.number > maxNum) {
        maxNum = parsed.number;
      }
    }
  }

  await updateChestCounterDB(teamId, gender, maxNum);
  return maxNum;
}

/**
 * Migration flag to avoid redundant executions per process lifetime.
 */
let hasMigrated = false;

/**
 * Migrates existing student chest numbers in the database to the new Team+Gender format (e.g. RB-001, RG-001).
 * Idempotent: safe to call on startup. Recalibrates counters and fixes jumped chest numbers.
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

    const validChestPattern = /^[A-Z][BG]-\d{3,}$/;

    // Process each team and gender to ensure proper prefix matching and sequential ordering
    for (const team of teams) {
      for (const gender of ["boy", "girl"] as const) {
        const prefix = getTeamPrefix(team.name, gender);

        // Find all students belonging to this team and gender/prefix
        const matchingStudents = students.filter((s) => {
          if (s.team_id !== team.id) return false;
          const chest = (s.chest_no || "").trim().toUpperCase();
          const parsed = parseChestNumber(chest);
          const studentGender = s.gender || (team.gender === "girls" ? "girl" : team.gender === "boys" ? "boy" : undefined);

          if (parsed && (chest.startsWith(prefix) || parsed.prefix === prefix || parsed.prefix === prefix.replace("-", ""))) {
            return true;
          }
          return studentGender === gender;
        });

        if (!matchingStudents.length) {
          // Reset counter if no students exist for this prefix
          await ChestCounterModel.updateOne(
            { team_id: team.id, gender },
            { $set: { last_number: 0 } },
            { upsert: true }
          );
          continue;
        }

        // Sort matching students by current chest number
        matchingStudents.sort((a, b) => {
          const numA = parseChestNumber(a.chest_no || "")?.number || 0;
          const numB = parseChestNumber(b.chest_no || "")?.number || 0;
          return numA - numB;
        });

        let expectedNum = 1;
        let highestNum = 0;

        for (const student of matchingStudents) {
          const parsed = parseChestNumber(student.chest_no || "");
          const currentNum = parsed?.number || 0;

          // Check if chest number is invalid or jumped (e.g. RG-012 when it should be RG-001)
          const isFormatted = validChestPattern.test((student.chest_no || "").trim().toUpperCase());
          const isJumped = (matchingStudents.length === 1 && currentNum > 1) ||
                           (currentNum > expectedNum && !matchingStudents.some((s) => parseChestNumber(s.chest_no || "")?.number === expectedNum));

          let assignedNum = currentNum;
          if (!isFormatted || isJumped) {
            assignedNum = expectedNum;
            const newChestNo = formatChestNumber(prefix, assignedNum);

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

          highestNum = Math.max(highestNum, assignedNum);
          expectedNum = assignedNum + 1;
        }

        await ChestCounterModel.updateOne(
          { team_id: team.id, gender },
          { $set: { last_number: highestNum } },
          { upsert: true }
        );
      }
    }

    console.log("✅ Chest number migration and counter sync completed successfully.");
    hasMigrated = true;
  } catch (error) {
    console.error("❌ Chest number migration failed:", error);
  }
}
