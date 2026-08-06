/**
 * Pure client-safe utility functions for chest numbers.
 * This file has NO server dependencies (no mongoose/db/models) and is safe to import in Client Components.
 */

/**
 * Returns team prefix based on team name and gender.
 * Examples:
 *  - Razmiyya + boy -> RB-
 *  - Razmiyya + girl -> RG-
 *  - Thazmiyyu + boy -> TB-
 *  - Thazmiyyu + girl -> TG-
 *  - Hazmiyya + boy -> HB-
 *  - Hazmiyya + girl -> HG-
 */
export function getTeamPrefix(teamName: string, gender?: string): string {
  const cleanName = (teamName || "").trim();
  const match = cleanName.match(/[a-zA-Z]/);
  const firstLetter = match ? match[0].toUpperCase() : (cleanName[0]?.toUpperCase() || "X");

  const isGirl = gender?.toLowerCase() === "girl" || gender?.toLowerCase() === "girls";
  const genderChar = isGirl ? "G" : "B";

  return `${firstLetter}${genderChar}-`;
}

/**
 * Formats prefix and number into a 3-digit padded chest number.
 * Example: RB- + 1 -> RB-001
 */
export function formatChestNumber(prefix: string, num: number): string {
  return `${prefix}${String(num).padStart(3, "0")}`;
}

/**
 * Parses chest number into prefix and number.
 * Supports format like RB-001, RB001, RA001, etc.
 */
export function parseChestNumber(chestNo: string): { prefix: string; number: number } | null {
  if (!chestNo) return null;
  const clean = chestNo.trim().toUpperCase();
  const match = clean.match(/^([A-Z]+-?)\s*(\d+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
  };
}

/**
 * Synchronous client-side or in-memory generator for next chest number.
 */
export function generateNextChestNumberSync(
  teamName: string,
  gender: string | undefined,
  existingStudents: Array<{ chest_no?: string; chestNumber?: string; gender?: string; team_id?: string; teamId?: string }>
): string {
  const targetPrefix = getTeamPrefix(teamName, gender);
  const normalizedTargetPrefix = targetPrefix.replace("-", "");

  const numbers: number[] = [];

  for (const student of existingStudents) {
    const chest = (student.chest_no || student.chestNumber || "").trim().toUpperCase();
    if (!chest) continue;

    const parsed = parseChestNumber(chest);
    if (!parsed) continue;

    const studentPrefix = parsed.prefix.replace("-", "");

    if (studentPrefix === normalizedTargetPrefix) {
      numbers.push(parsed.number);
    }
  }

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  return formatChestNumber(targetPrefix, nextNumber);
}

/**
 * Sorts an array of objects containing chest numbers in natural ascending numerical order by chest prefix and number.
 * Example order: RB-001, RB-002, ..., RB-010, ..., RG-001, RG-002...
 */
export function sortStudentsByChestNumber<T extends { chest_no?: string; chestNumber?: string }>(students: T[]): T[] {
  return [...students].sort((a, b) => {
    const chestA = (a.chest_no || a.chestNumber || "").trim().toUpperCase();
    const chestB = (b.chest_no || b.chestNumber || "").trim().toUpperCase();
    const parsedA = parseChestNumber(chestA);
    const parsedB = parseChestNumber(chestB);
    if (parsedA && parsedB) {
      const prefixCompare = parsedA.prefix.localeCompare(parsedB.prefix);
      if (prefixCompare !== 0) return prefixCompare;
      return parsedA.number - parsedB.number;
    }
    return chestA.localeCompare(chestB, undefined, { numeric: true, sensitivity: "base" });
  });
}
