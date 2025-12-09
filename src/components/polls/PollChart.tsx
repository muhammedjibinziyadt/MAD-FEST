"use client";

import { motion } from "framer-motion";
import { PollOption } from "@/lib/types";

interface PollChartProps {
    options: PollOption[];
    totalVotes: number;
}

export function PollChart({ options, totalVotes }: PollChartProps) {
    const maxVotes = Math.max(...options.map(o => o.votes));

    return (
        <div className="space-y-4 w-full">
            {options.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                return (
                    <div key={option.id} className="relative w-full h-14 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 isolate">
                        {/* The Fill Layer */}
                        <motion.div
                            className="absolute top-0 left-0 bottom-0 bg-black dark:bg-white z-0"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />

                        {/* Content Layer with Color Mixing */}
                        {/* We use mix-blend-mode: difference with WHITE text.
                            On Black BG (Fill): White - Black = White (Visible)
                            On White BG (Empty): White - White = Black (Visible)
                        */}
                        <div className="absolute inset-0 flex items-center justify-between px-6 z-10 text-white dark:text-black mix-blend-difference pointer-events-none">
                            <span className="font-bold text-lg leading-none">{option.text}</span>
                            <span className="font-mono font-bold text-lg leading-none">
                                {Math.round(percentage)}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
