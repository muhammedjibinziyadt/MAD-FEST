import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PredictionModel, PredictionEventModel, UserScoreModel } from "@/lib/models";
import { emitLeaderboardUpdated, emitPredictionClosed } from "@/lib/pusher";
import { Prediction } from "@/lib/types";

export async function POST(request: Request) {
    await connectDB();
    try {
        const { eventId, correctOptionId } = await request.json();

        const [event, correctPredictions] = await Promise.all([
            PredictionEventModel.findOne({ id: eventId }),
            PredictionModel.find({ eventId, selectedOptionId: correctOptionId }) as Promise<Prediction[]>
        ]);

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (event.status === "evaluated") {
            return NextResponse.json({ error: "Event already evaluated" }, { status: 400 });
        }

        // Update event
        await PredictionEventModel.updateOne(
            { id: eventId },
            { $set: { status: "evaluated", correctOptionId } }
        );

        const points = event.points || 10;

        // Bulk update scores
        if (correctPredictions.length > 0) {
            const updates = correctPredictions.map((pred) => ({
                updateOne: {
                    filter: { userId: pred.userId },
                    update: {
                        $set: { userName: pred.userName },
                        $inc: { score: points }
                    },
                    upsert: true
                }
            }));
            await UserScoreModel.bulkWrite(updates);
        }

        await emitPredictionClosed(eventId);
        await emitLeaderboardUpdated();

        return NextResponse.json({
            message: "Evaluated successfully",
            correctCount: correctPredictions.length
        });
    } catch (error) {
        console.error("Evaluation error:", error);
        return NextResponse.json({ error: "Failed to evaluate" }, { status: 500 });
    }
}
