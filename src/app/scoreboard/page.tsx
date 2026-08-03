import { getApprovedResults, getLiveScores, getPrograms, getStudents, getTeams } from "@/lib/data";
import { ScoreboardRealtime } from "@/components/scoreboard-realtime";

export const dynamic = "force-dynamic";

async function getScoreboardData() {
  const [teams, programs, results, students, liveScores] = await Promise.all([
    getTeams(),
    getPrograms(),
    getApprovedResults(),
    getStudents(),
    getLiveScores(),
  ]);

  // Sort results by submitted_at descending (newest first)
  const sortedResults = [...results].sort((a, b) => {
    const dateA = new Date(a.submitted_at).getTime();
    const dateB = new Date(b.submitted_at).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const scoreMap = new Map(liveScores.map((entry) => [entry.team_id, entry.total_points]));

  return { teams, programs, results: sortedResults, students, liveScores: scoreMap };
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Scoreboard & Team Standings",
  description: "View the live team standings, house points, and leaderboard for Ishal Rabeeh '26. Track leading teams in real-time.",
  openGraph: {
    title: "Live Scoreboard & Team Standings | Ishal Rabeeh '26",
    description: "Track real-time house points and category standings for Ishal Rabeeh '26.",
    url: (process.env.NEXT_PUBLIC_APP_URL || "https://www.ishalrabeehbuhsm.online/") + "scoreboard",
    siteName: "Ishal Rabeeh '26",
    images: ["/img/assets/logo-new.png"],
    type: "website",
  },
};

export default async function ScoreboardPage() {
  const data = await getScoreboardData();

  return (
    <main className="min-h-screen bg-[#fffcf5]">
      <ScoreboardRealtime
        teams={data.teams}
        programs={data.programs}
        results={data.results}
        students={data.students}
        liveScores={data.liveScores}
      />
    </main>
  );
}

