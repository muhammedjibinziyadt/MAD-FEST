"use client";

import { useState, useEffect } from "react";
import { Poll } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { PollChart } from "./PollChart";
import { pusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusher";
import { toast } from "react-toastify";
import { Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PollCardProps {
    poll: Poll;
}

export function PollCard({ poll: initialPoll }: PollCardProps) {
    const [poll, setPoll] = useState<Poll>(initialPoll);
    const [isVoted, setIsVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Check local storage
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
        if (votedPolls.includes(poll.id)) {
            setIsVoted(true);
            // If already voted, maybe we want it expanded by default? 
            // Or stick to "closed by default" as per user request.
        }

        // Subscribe to Pusher
        const channel = pusherClient.subscribe(CHANNELS.POLLS);

        // Bind to poll-updated
        channel.bind(EVENTS.POLL_UPDATED, (data: { pollId: string }) => {
            if (data.pollId === poll.id) {
                fetchPollData();
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [poll.id]);

    const fetchPollData = async () => {
        try {
            const res = await fetch(`/api/polls/${poll.id}`);
            if (res.ok) {
                const updatedPoll = await res.json();
                setPoll(updatedPoll);
            }
        } catch (error) {
            console.error("Failed to update poll", error);
        }
    };

    const handleVote = async (optionId: string) => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/polls/${poll.id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to vote");
            }

            // Success
            setIsVoted(true);
            const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "[]");
            localStorage.setItem("votedPolls", JSON.stringify([...votedPolls, poll.id]));
            toast.success("Vote submitted!");
            fetchPollData();
        } catch (error: any) {
            toast.error(error.message);
            if (error.message.includes("already voted")) {
                setIsVoted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

    return (
        <Card
            className="w-full max-w-md mx-auto hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden border-0 shadow-lg bg-transparent"
        >
            {/* Header / Trigger */}
            <div
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "bg-[#8B4513] p-8 text-center cursor-pointer relative transition-all duration-300",
                    expanded ? "rounded-t-3xl" : "rounded-3xl hover:scale-[1.02]"
                )}
            >
                <h3 className="text-xl font-bold text-white leading-tight select-none">{poll.question}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <p className="text-white/70 text-xs font-medium tracking-wider uppercase">
                        {totalVotes} Votes
                    </p>
                    <ChevronDown className={cn("w-4 h-4 text-white/70 transition-transform duration-300", expanded && "rotate-180")} />
                </div>
            </div>

            {/* Expandable Content */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-[#8B4513]/10 rounded-b-3xl"
                    >
                        <CardContent className="p-6 space-y-4 bg-[#8B4513]/4 min-h-[200px] flex flex-col justify-center">
                            {isVoted ? (
                                <PollChart options={poll.options} totalVotes={totalVotes} />
                            ) : (
                                <div className="grid gap-4">
                                    {poll.options.map((option) => (
                                        <button
                                            key={option.id}
                                            className="w-full relative group overflow-hidden rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent closing card when voting
                                                handleVote(option.id);
                                            }}
                                            disabled={loading}
                                        >
                                            <span className="block text-center font-semibold text-zinc-700 dark:text-zinc-200 text-lg">
                                                {option.text}
                                            </span>
                                            {loading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
                                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-900 dark:text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
