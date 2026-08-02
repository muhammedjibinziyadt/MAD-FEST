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
  const targetGender = (gender?.toLowerCase() === "girl" || gender?.toLowerCase() === "girls") ? "girl" : "boy";

  const numbers: number[] = [];

  for (const student of existingStudents) {
    const chest = (student.chest_no || student.chestNumber || "").trim().toUpperCase();
    if (!chest) continue;

    const parsed = parseChestNumber(chest);
    if (!parsed) continue;

    // Check if chest number matches target prefix (e.g., RB- or RB)
    const matchesPrefix = chest.startsWith(targetPrefix) || chest.startsWith(targetPrefix.replace("-", ""));

    // Also check student gender if present
    const studentGender = student.gender ? (student.gender.toLowerCase() === "girl" ? "girl" : "boy") : undefined;

    if (matchesPrefix || (studentGender && studentGender === targetGender && chest.includes(targetPrefix.slice(0, 2)))) {
      numbers.push(parsed.number);
    }
  }

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  return formatChestNumber(targetPrefix, nextNumber);
}
