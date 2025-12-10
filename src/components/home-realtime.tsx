"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveScorePulse } from "@/components/live-score-pulse";
import { TeamLeadersShowcase } from "@/components/team-leaders-showcase";
import { HomeEngagementSection } from "@/components/HomeEngagementSection";
import { AboutSection } from "@/components/AboutSection";

import { useScoreboardUpdates } from "@/hooks/use-realtime";
import { useRouter } from "next/navigation";
import type { Team } from "@/lib/types";

interface HomeRealtimeProps {
  teams: Team[];
  liveScores: Map<string, number>;
}

export function HomeRealtime({ teams: initialTeams, liveScores: initialLiveScores }: HomeRealtimeProps) {
  const router = useRouter();

  useScoreboardUpdates(() => {
    router.refresh();
  });

  return (
    <main className="space-y-16">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FFFCF5]">

        {/* Decorative Sun/Starburst - Left (Half Visible) */}
        <div className="absolute top-3/4 left-0 -translate-y-1/2 -translate-x-1/2 w-40 h-40 opacity-90 animate-[sun-rotate_60s_linear_infinite]">
          <Image
            src="/img/assets/sun.webp"
            alt="Decoration Left"
            fill
            className="object-contain"
          />
        </div>

        {/* Decorative Sun/Starburst - Top Right (Half Visible) */}
        <div className="absolute top-20 right-0 translate-x-1/2 w-48 h-48 opacity-90 animate-[sun-rotate_60s_linear_infinite]">
          <Image
            src="/img/assets/sun.webp"
            alt="Decoration Right"
            fill
            className="object-contain"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-40 flex flex-col items-center text-center px-4 max-w-5xl -mt-10">

          {/* Small Star above Ship */}
          {/* <div className="relative w-8 h-8 sm:w-12 sm:h-12 mb-4 animate-[spin_12s_linear_infinite]">
            <Image
              src="/img/assets/sun.webp"
              alt="Star"
              fill
              className="object-contain"
            />
          </div> */}

          {/* Ship - Center */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[300px] lg:h-[300px] mb-2">
            <Image
              src="/img/assets/ship.webp"
              alt="Ship"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Main Title - Charutha Font */}
          <div>
            <h1 className="text-[#8B4513] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 font-['Charutha'] tracking-wide drop-shadow-sm leading-5">
            FUNOON FIESTA '25-26
          </h1>

          {/* Subtitle - Bricolage Font */}
          <h2 className="text-black text-xl sm:text-xl md:text-2xl font-['Bricolage'] mb-6 font-semibold tracking-tight">
            Showcasing Islamic Art & Culture
          </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8 px-4">
            For a hundred years, the Malabar coast has echoed with knowledge, faith, and art. Funoon
            Fiesta 2025–26 bridges this rich legacy with a new generation, honoring Samastha’s
            centenary under the theme “Shathakam Saakshi.”
          </p>

          {/* CTA Button */}
          <div className="relative z-50">
            <Link href="/results">
              <Button className="bg-[#F2C04D] hover:bg-[#dgb13d] text-black font-medium text-lg px-6 py-6 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-3">
                Click to Dive In
              </Button>
            </Link>
          </div>
        </div>

        {/* Waves - Bottom Layered - Infinite Loop SVG */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] sm:h-[180px] md:h-[220px] z-30 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 2880 320">
            {/* Wave 3 (Back) */}
            <path
              fill="#0891b2"
              fillOpacity="1"
              d="M0,220 C480 290 960 150 1440 220 C1920 290 2400 150 2880 220 V320 H0 Z"
              className="animate-[wave-slide_20s_linear_infinite]"
              style={{ transformBox: 'fill-box' }}
            />
            {/* Wave 2 (Middle) */}
            <path
              fill="#0e7490"
              fillOpacity="1"
              d="M0,250 C400 310 1000 170 1440 250 C1840 310 2440 170 2880 250 V320 H0 Z"
              className="animate-[wave-slide_15s_linear_infinite]"
              style={{ animationDirection: 'reverse' }}
            />
            {/* Wave 1 (Front) */}
            <path
              fill="#155e75"
              fillOpacity="1"
              d="M0,280 C550 330 850 210 1440 280 C2030 330 2230 210 2880 280 V320 H0 Z"
              className="animate-[wave-slide_12s_linear_infinite]"
            />
          </svg>
        </div>
      </section>

      {/* Live Score Pulse Section */}
      <section className="bg-[#fffcf5] py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
          <LiveScorePulse teams={initialTeams} liveScores={initialLiveScores} />
        </div>
      </section>

      {/* Engagement Section */}
      <HomeEngagementSection />

      {/* Team Leaders Section */}
      <section className="bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
          <TeamLeadersShowcase teams={initialTeams} />
        </div>
      </section>

      {/* About Funoon Fiesta Section */}
      <AboutSection />

      {/* Control Room Section */}
      <section className="bg-gradient-to-br from-[#8B4513]/5 to-[#0d7377]/5 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 md:p-12 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
              <div className="flex-1">
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 mb-3 sm:mb-4 text-xs sm:text-sm">Need help?</Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#8B4513] mb-3 sm:mb-4">
                  Funoon Fiesta Control Room
                </h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Contact us for support, inquiries, or assistance with the platform.
                  Our team is here to help ensure a smooth and enjoyable experience.
                  <Link href="/admin/login" className="">
                    <Button variant="secondary" className="text-sm text-black font-normal ml-2">
                      Admin Login
                    </Button>
                  </Link>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link href="/jury/login" className="w-full sm:w-auto">
                  <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 border border-gray-300 w-full sm:w-auto text-sm sm:text-base">
                    Jury Login
                  </Button>
                </Link>
                <Link href="/team/login" className="w-full sm:w-auto">
                  <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white w-full sm:w-auto text-sm sm:text-base">
                    Team Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main >
  );
}
