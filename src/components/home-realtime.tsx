"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music2, ArrowRight } from "lucide-react"; // Added Music2, ArrowRight
import { LiveScorePulse } from "@/components/live-score-pulse";
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
        <div className="absolute top-3/4 left-0 -translate-y-1/2 -translate-x-1/2 w-20 h-20 md:w-40 md:h-40 opacity-90 animate-[sun-rotate_60s_linear_infinite]">
          <Image
            src="/img/assets/sun.webp"
            alt="Decoration Left"
            fill
            className="object-contain"
          />
        </div>

        {/* Decorative Sun/Starburst - Top Right (Half Visible) */}
        <div className="absolute top-20 right-0 translate-x-1/2 w-26 h-26 md:w-48 md:h-48 opacity-90 animate-[sun-rotate_60s_linear_infinite]">
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
              src="/img/assets/logo-new.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Main Title - Charutha Font */}
          <div>
            <h1 className="text-[#A13A24] text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-3 font-['Charutha'] tracking-wide leading-[0.95]">
              Busthanul Uloom <br /> Higher Secondary Madrasa
            </h1>

            {/* Subtitle - Bricolage Font */}
            <h2 className="text-black text-xl sm:text-xl md:text-3xl font-['Bricolage'] mb-6 font-semibold tracking-tight">
              ഇസ്‌ലാമിക കലയുടെയും സംസ്‌കാരത്തിന്റെയും മഹാമേള
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-8 px-4 leading-relaxed font-light">
            കലയുടെ ചിറകിൽ വിശ്വാസത്തിന്റെ വെളിച്ചം.
            ഓരോ പ്രതിഭയ്ക്കും വേദിയൊരുക്കുന്ന ഇശൽ റബീഅ് 26 ലേക്ക് സ്വാഗതം.
          </p>

          {/* CTA Buttons */}
          <div className="relative z-50 flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/results">
              <div className="bg-[#F2C04D] hover:bg-[#dbb13d] text-black font-medium text-lg px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-3 active:scale-95">
                ഫലം അറിയാം
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Desktop Waves - Responsive Width */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full h-[220px] lg:h-[260px] z-30 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-[200%] h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 2880 320">
            {/* Wave 3 (Back) - Period 720px (4 cycles) */}
            <path
              fill="#FEF08A"
              fillOpacity="1"
              d="M0,230 
                 C240,180 480,280 720,230 
                 C960,180 1200,280 1440,230 
                 C1680,180 1920,280 2160,230 
                 C2400,180 2640,280 2880,230 
                 V320 H0 Z"
              className="animate-[wave-slide_20s_linear_infinite]"
              style={{ transformBox: 'fill-box' }}
            />
            {/* Wave 2 (Middle) - Period 480px (6 cycles) */}
            <path
              fill="#F59E0B"
              fillOpacity="1"
              d="M0,260 
                 C160,220 320,300 480,260 
                 C640,220 800,300 960,260 
                 C1120,220 1280,300 1440,260 
                 C1600,220 1760,300 1920,260 
                 C2080,220 2240,300 2400,260 
                 C2560,220 2720,300 2880,260 
                 V320 H0 Z"
              className="animate-[wave-slide_15s_linear_infinite]"
              style={{ animationDirection: 'reverse' }}
            />
            {/* Wave 1 (Front) - Period 720px (4 cycles), Offset Phase */}
            <path
              fill="#F2C04D"
              fillOpacity="1"
              d="M0,290 
                 C240,340 480,240 720,290 
                 C960,340 1200,240 1440,290 
                 C1680,340 1920,240 2160,290 
                 C2400,340 2640,240 2880,290 
                 V320 H0 Z"
              className="animate-[wave-slide_12s_linear_infinite]"
            />
          </svg>
        </div>

        {/* Mobile Waves - Fixed Width & Taller */}
        <div className="md:hidden absolute bottom-0 left-0 w-full h-[320px] z-30 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-[2880px] h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 2880 320">
            {/* Wave 3 (Back) */}
            <path
              fill="#FEF08A"
              fillOpacity="1"
              d="M0,230 C240,180 480,280 720,230 C960,180 1200,280 1440,230 C1680,180 1920,280 2160,230 C2400,180 2640,280 2880,230 V320 H0 Z"
              className="animate-[wave-slide_20s_linear_infinite]"
              style={{ transformBox: 'fill-box' }}
            />
            {/* Wave 2 (Middle) */}
            <path
              fill="#F59E0B"
              fillOpacity="1"
              d="M0,260 C160,220 320,300 480,260 C640,220 800,300 960,260 C1120,220 1280,300 1440,260 C1600,220 1760,300 1920,260 C2080,220 2240,300 2400,260 C2560,220 2720,300 2880,260 V320 H0 Z"
              className="animate-[wave-slide_15s_linear_infinite]"
              style={{ animationDirection: 'reverse' }}
            />
            {/* Wave 1 (Front) */}
            <path
              fill="#F2C04D"
              fillOpacity="1"
              d="M0,290 C240,340 480,240 720,290 C960,340 1200,240 1440,290 C1680,340 1920,240 2160,290 C2400,340 2640,240 2880,290 V320 H0 Z"
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
      {/* About Funoon Fiesta Section */}
      <AboutSection />

      {/* Control Room Section */}
      <section className="bg-gradient-to-br from-[#8B4513]/5 to-[#0d7377]/5 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 md:p-12 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
              <div className="flex-1">
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 mb-3 sm:mb-4 text-xs sm:text-sm">സഹായം വേണോ?</Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#8B4513] mb-3 sm:mb-4">
                  ഇശൽ റബീഅ് കൺട്രോൾ റൂം
                </h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-2xl">
                  പ്ലാറ്റ്‌ഫോമുമായി ബന്ധപ്പെട്ട സംശയങ്ങൾക്കും സഹായങ്ങൾക്കുമായി ഞങ്ങളുമായി ബന്ധപ്പെടുക.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link href="/jury/login" className="w-full sm:w-auto">
                  <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 border border-gray-300 w-full sm:w-auto text-sm sm:text-base">
                    ജൂറി ലോഗിൻ
                  </Button>
                </Link>
                <Link href="/team/login" className="w-full sm:w-auto">
                  <Button className="bg-[#8B4513] hover:bg-[#6B3410] text-white w-full sm:w-auto text-sm sm:text-base">
                    ടീം പോർട്ടൽ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
