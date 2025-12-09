"use client";

import { useEffect, useState } from "react";
import { PredictionEvent } from "@/lib/types";
import { PredictionCard } from "@/components/predictions/PredictionCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, Loader2, Zap, History, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function PredictionsPage() {
    const [events, setEvents] = useState<PredictionEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'live' | 'history'>('live');

    useEffect(() => {
        fetch("/api/predictions")
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch((e) => setLoading(false));
    }, []);

    const openEvents = events.filter(e => e.status === 'open');
    const pastEvents = events.filter(e => e.status !== 'open');
    const totalPoints = events.reduce((acc, e) => acc + e.points, 0);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#8B4513]" /></div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#8B4513]/10 p-8 md:p-12 text-center border border-white/10 shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-grid-white/5 mask-image-gradient" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-[#8B4513] to-[#6B3410] bg-clip-text text-transparent">
                        Predict & Win
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Put your instincts to the test! Guess the winners of upcoming programs and climb the global leaderboard.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/predictions/leaderboard">
                            <Button size="lg" className="bg-[#6B3410] text-white border-0 hover:opacity-90 shadow-lg hover:shadow-[#8B4513]/25 transition-all rounded-full px-8">
                                <Trophy className="w-5 h-5 mr-2" /> View Leaderboard
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
                        <div className="bg-background/40 backdrop-blur rounded-2xl p-3 border border-white/5">
                            <div className="flex items-center justify-center gap-2 text-[#8B4513] font-bold text-2xl">
                                <Zap className="w-5 h-5" /> {openEvents.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Live Events</div>
                        </div>
                        <div className="bg-background/40 backdrop-blur rounded-2xl p-3 border border-white/5">
                            <div className="flex items-center justify-center gap-2 text-[#8B4513]/80 font-bold text-2xl">
                                <History className="w-5 h-5" /> {pastEvents.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Past Results</div>
                        </div>
                        <div className="bg-background/40 backdrop-blur rounded-2xl p-3 border border-white/5 col-span-2 md:col-span-1">
                            <div className="flex items-center justify-center gap-2 text-[#6B3410] font-bold text-2xl">
                                <Trophy className="w-5 h-5" /> {totalPoints}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Points Pool</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex flex-col items-center space-y-6">
                <div className="inline-flex bg-muted p-1 rounded-full">
                    <button
                        onClick={() => setTab('live')}
                        className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${tab === 'live'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Zap className="w-4 h-4" /> Live Predictions
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${tab === 'history'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <History className="w-4 h-4" /> Past Events
                    </button>
                </div>

                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {tab === 'live' ? (
                            <motion.div
                                key="live"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                {openEvents.length === 0 ? (
                                    <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed flex flex-col items-center">
                                        <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-lg font-semibold">No live predictions</h3>
                                        <p className="text-muted-foreground">Check back later for new events!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {openEvents.map((evt, i) => (
                                            <motion.div
                                                key={evt.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <PredictionCard event={evt} />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full"
                            >
                                {pastEvents.length === 0 ? (
                                    <div className="text-center py-20 text-muted-foreground">No past events yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90">
                                        {pastEvents.map((evt, i) => (
                                            <motion.div
                                                key={evt.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <PredictionCard event={evt} />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
