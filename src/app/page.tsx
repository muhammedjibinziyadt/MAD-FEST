import { getLiveScores, getTeams } from "@/lib/data";
import { HomeRealtime } from "@/components/home-realtime";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [teams, live] = await Promise.all([
    getTeams(),
    getLiveScores(),
  ]);

  const scoreMap = new Map(live.map((item) => [item.team_id, item.total_points]));
  const sorted = [...teams].sort(
    (a, b) =>
      (scoreMap.get(b.id) ?? b.total_points) -
      (scoreMap.get(a.id) ?? a.total_points),
  );

  return { teams: sorted, live: scoreMap };
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ishal Rabeeh '26 - Showcasing Islamic Art & Culture",
  description: "Official portal for Ishal Rabeeh '26. View real-time team standings, live scoreboards, program results, participant search, and cultural event updates.",
  openGraph: {
    title: "Ishal Rabeeh '26 - Showcasing Islamic Art & Culture",
    description: "Real-time team standings, live scoreboards, program results, and candidate profiles for Ishal Rabeeh '26.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://www.ishalrabeehbuhsm.online/",
    siteName: "Ishal Rabeeh '26",
    images: ["/img/assets/logo-new.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishal Rabeeh '26",
    description: "Real-time team standings and live scoreboards for Ishal Rabeeh '26.",
    images: ["/img/assets/logo-new.png"],
  },
};

export default async function HomePage() {
  const { teams, live } = await getHomeData();

  return <HomeRealtime teams={teams} liveScores={live} />;
}
