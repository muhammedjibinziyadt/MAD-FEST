import { PollCard } from "@/components/polls/PollCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PollModel } from "@/lib/models";
import { notFound } from "next/navigation";

export default async function SinglePollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await connectDB();
    const rawPoll = await PollModel.findOne({ id }).lean();

    if (!rawPoll) {
        notFound();
    }

    const poll = JSON.parse(JSON.stringify(rawPoll));

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            <div className="w-full max-w-md mb-4">
                <Link href="/polls" className="inline-flex items-center text-sm hover:underline text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
                </Link>
            </div>
            <PollCard poll={poll} />
        </div>
    );
}
