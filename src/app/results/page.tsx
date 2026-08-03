import { getApprovedResults, getPrograms, getStudents, getTeams } from "@/lib/data";
import { ResultsRealtime } from "@/components/results-realtime";

export const dynamic = "force-dynamic";

async function getResultsData() {
  const [results, programs, students, teams] = await Promise.all([
    getApprovedResults(),
    getPrograms(),
    getStudents(),
    getTeams(),
  ]);

  // Sort results by submitted_at descending (newest first)
  const sortedResults = [...results].sort((a, b) => {
    const dateA = new Date(a.submitted_at).getTime();
    const dateB = new Date(b.submitted_at).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const programMap = new Map(programs.map((p) => [p.id, p]));

  return {
    results: sortedResults,
    programs,
    programMap,
    students,
    teams,
  };
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Competition Results",
  description: "Check the latest published results of Ishal Rabeeh '26 competitions. Real-time updates on winners, 1st, 2nd, 3rd positions, and grade bonuses.",
  openGraph: {
    title: "Live Competition Results | Ishal Rabeeh '26",
    description: "Real-time updates on winners, placements, and grades across all categories.",
    url: (process.env.NEXT_PUBLIC_APP_URL || "https://www.ishalrabeehbuhsm.online/") + "results",
    siteName: "Ishal Rabeeh '26",
    images: ["/img/assets/logo-new.png"],
    type: "website",
  },
};

export default async function ResultsPage() {
  const data = await getResultsData();

  return (
    <ResultsRealtime
      programs={data.programs}
      results={data.results}
      programMap={data.programMap}
      students={data.students}
      teams={data.teams}
    />
  );
}

