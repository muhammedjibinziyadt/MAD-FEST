"use client";

import { useEffect, useState } from "react";
import { Poll } from "@/lib/types";
import { PollCard } from "@/components/polls/PollCard";
import { motion } from "framer-motion";
import { Loader2, Activity, BarChart2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PollsPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

    useEffect(() => {
        fetch("/api/polls")
            .then((res) => res.json())
            .then((data) => {
                setPolls(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to load polls", error);
                setLoading(false);
            });
    }, []);

    const activePolls = polls.filter(p => p.active);
    const totalVotes = polls.reduce((acc, p) => acc + p.options.reduce((a, b) => a + b.votes, 0), 0);

    const filteredPolls = polls.filter(p => {
        if (filter === 'active') return p.active;
        if (filter === 'closed') return !p.active;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#8B4513]/10 p-8 md:p-12 text-center border border-white/10 shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-grid-white/5 mask-image-gradient" />
                <h1 className="relative text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-[#8B4513] to-[#6B3410] bg-clip-text text-transparent">
                    Live Polls
                </h1>
                <p className="relative text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Voice your opinion! Participate in real-time polls and see what the community thinks about the latest events.
                </p>

                {/* Quick Stats */}
                <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
                    <Card className="bg-background/50 backdrop-blur border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center">
                            <BarChart2 className="w-6 h-6 text-primary mb-2" />
                            <div className="text-2xl font-bold">{polls.length}</div>
                            <div className="text-xs text-muted-foreground">Total Polls</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center">
                            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                            <div className="text-2xl font-bold">{activePolls.length}</div>
                            <div className="text-xs text-muted-foreground">Active Now</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur border-none shadow-sm col-span-2 md:col-span-1">
                        <CardContent className="p-4 flex flex-col items-center">
                            <CheckCircle2 className="w-6 h-6 text-blue-500 mb-2" />
                            <div className="text-2xl font-bold">{totalVotes}</div>
                            <div className="text-xs text-muted-foreground">Community Votes</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-center">
                <div className="inline-flex bg-muted p-1 rounded-xl">
                    {['all', 'active', 'closed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-background text-foreground shadow-sm scale-105'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Polls Grid */}
            {filteredPolls.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                    <p className="text-muted-foreground text-lg">No polls found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolls.map((poll, index) => (
                        <motion.div
                            key={poll.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <PollCard poll={poll} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
