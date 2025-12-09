"use client";

import { useState, useEffect } from "react";
import { PredictionEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionCardProps {
    event: PredictionEvent;
}

export function PredictionCard({ event }: PredictionCardProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasPredicted, setHasPredicted] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    const deadline = new Date(event.deadline);
    const isExpired = new Date() > deadline;

    useEffect(() => {
        // Check local storage for previous prediction
        const predictions = JSON.parse(localStorage.getItem("predictions") || "{}");
        if (predictions[event.id]) {
            setHasPredicted(true);
            setSelectedOption(predictions[event.id]);
        }

        // Timer
        const updateTimer = () => {
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Closed");
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${h}h ${m}m remaining`);
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000);

        return () => clearInterval(timer);
    }, [event.id, event.deadline]);

    const handleSubmit = async () => {
        if (!selectedOption) return;

        // Simple User Auth Simulation
        let userProfile = JSON.parse(localStorage.getItem("userProfile") || "null");
        if (!userProfile) {
            const name = prompt("Enter your name to compete in the leaderboard:");
            if (!name) return;
            const id = crypto.randomUUID();
            userProfile = { id, name };
            localStorage.setItem("userProfile", JSON.stringify(userProfile));
        }

        setLoading(true);
        try {
            const res = await fetch("/api/predictions/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    userId: userProfile.id,
                    userName: userProfile.name,
                    selectedOptionId: selectedOption,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit");
            }

            toast.success("Prediction locked in!");
            setHasPredicted(true);
            const predictions = JSON.parse(localStorage.getItem("predictions") || "{}");
            predictions[event.id] = selectedOption;
            localStorage.setItem("predictions", JSON.stringify(predictions));

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn("w-full transition-all duration-300 border-l-4",
            hasPredicted ? "border-l-green-500 bg-emerald-50/10" : "border-l-[#8B4513]"
        )}>
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                        {event.programName}
                    </span>
                    <span className={cn("text-xs font-bold flex items-center gap-1",
                        isExpired ? "text-red-500" : "text-green-600"
                    )}>
                        <Clock className="w-3 h-3" />
                        {timeLeft}
                    </span>
                </div>
                <CardTitle className="text-lg">{event.question}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {event.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => !hasPredicted && !isExpired ? setSelectedOption(option.id) : null}
                            className={cn(
                                "p-4 rounded-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95",
                                selectedOption === option.id
                                    ? "bg-[#8B4513] text-white border-[#8B4513] shadow-lg ring-2 ring-offset-2 ring-[#8B4513]"
                                    : "bg-card hover:bg-[#8B4513]/5 border-border",
                                (hasPredicted || isExpired) && selectedOption !== option.id && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={hasPredicted || isExpired}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="justify-between">
                <div className="flex items-center text-sm font-medium text-[#8B4513] gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>Win {event.points} pts</span>
                </div>
                {!hasPredicted && !isExpired && (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOption || loading}
                        className="bg-[#8B4513] hover:bg-[#6B3410] text-white"
                    >
                        {loading ? "Submitting..." : "Lock Prediction"}
                    </Button>
                )}
                {hasPredicted && (
                    <span className="text-sm font-medium text-green-600">Prediction Submitted</span>
                )}
            </CardFooter>
        </Card>
    );
}
