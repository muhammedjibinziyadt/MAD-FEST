import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PollModel, VoteModel } from "@/lib/models";
import { emitPollUpdated } from "@/lib/pusher";
import { Poll } from "@/lib/types";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();
    try {
        const { optionId } = await request.json();

        // Simple voter identification logic
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";
        // In a real app, hash this properly.
        const voterHash = Buffer.from(`${ip}-${userAgent}`).toString('base64');

        // Check if already voted
        const existingVote = await VoteModel.findOne({ pollId: id, voterHash });
        if (existingVote) {
            return NextResponse.json(
                { error: "You have already voted in this poll" },
                { status: 403 }
            );
        }

        // Check if poll exists and is active
        const poll = await PollModel.findOne({ id }) as Poll | null;
        if (!poll || !poll.active) {
            return NextResponse.json(
                { error: "Poll not found or inactive" },
                { status: 404 }
            );
        }

        // Verify option exists
        const optionExists = poll.options.some((opt) => opt.id === optionId);
        if (!optionExists) {
            return NextResponse.json({ error: "Invalid option" }, { status: 400 });
        }

        // Record vote
        await VoteModel.create({
            pollId: id,
            optionId,
            voterHash,
            timestamp: new Date().toISOString(),
        });

        // Update poll counts
        await PollModel.updateOne(
            { id, "options.id": optionId },
            { $inc: { "options.$.votes": 1 } }
        );

        // Trigger Pusher update
        await emitPollUpdated(id);

        return NextResponse.json({ message: "Vote submitted" });
    } catch (error) {
        console.error("Vote error:", error);
        return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
    }
}
