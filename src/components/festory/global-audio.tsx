"use client";

import { useEffect, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { CHANNELS, EVENTS } from "@/lib/pusher";
import { Zap, Volume2, X } from "lucide-react";
import { triggerAudioBomb } from "@/app/festory/actions";
import { Button } from "@/components/ui/button";

const AUDIO_BOMBS = [
    { id: "airhorn", name: "Air Horn", color: "bg-red-500", icon: "📢" },
    { id: "drumroll", name: "Drum Roll", color: "bg-blue-500", icon: "🥁" },
    { id: "applause", name: "Applause", color: "bg-green-500", icon: "👏" },
    { id: "laugh", name: "Laugh", color: "bg-yellow-500", icon: "😂" },
];

export function GlobalAudio() {
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(false);

    // Audio context for synthesizer (pro move: no assets needed)
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const playSynthesizedSound = (type: string) => {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'airhorn') {
            // Airhorn simulation: Sawtooth wave, descending pitch rapidly
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'applause') {
            // White noise burst (Simulated with simple random buffer)
            // Complexity limited without sample data, fallback to simple beep for MVP
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else {
            // Generic low beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    };

    useEffect(() => {
        const channel = pusherClient.subscribe(CHANNELS.FESTORY);

        const handleAudioBomb = (data: { sound: string, user: string }) => {
            setIsPlaying(`Bomb by ${data.user}`);
            playSynthesizedSound(data.sound);
            setTimeout(() => setIsPlaying(null), 2000);
        };

        const handleAnnouncement = (data: { audioUrl: string, user: string }) => {
            // Play announcement
            const audio = new Audio(data.audioUrl);
            audio.play().catch(e => console.log("Autoplay blocked", e));
            setIsPlaying(`Announcement by ${data.user}`);
            audio.onended = () => setIsPlaying(null);
        };

        channel.bind(EVENTS.FESTORY_AUDIO_BOMB, handleAudioBomb);
        channel.bind(EVENTS.FESTORY_ANNOUNCEMENT, handleAnnouncement);

        return () => {
            channel.unbind(EVENTS.FESTORY_AUDIO_BOMB, handleAudioBomb);
            channel.unbind(EVENTS.FESTORY_ANNOUNCEMENT, handleAnnouncement);
            pusherClient.unsubscribe(CHANNELS.FESTORY);
        };
    }, []);

    const handleTrigger = async (soundId: string) => {
        // Optimistic local play
        playSynthesizedSound(soundId);
        await triggerAudioBomb(soundId);
    };

    return (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col-reverse items-end gap-2">
            <Button
                size="icon"
                variant="ghost"
                className="w-12 h-12 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/40"
                onClick={() => setShowControls(!showControls)}
            >
                {showControls ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </Button>

            {showControls && (
                <div className="bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex flex-col gap-2 animate-in slide-in-from-bottom-10 fade-in">
                    {AUDIO_BOMBS.map(bomb => (
                        <button
                            key={bomb.id}
                            onClick={() => handleTrigger(bomb.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform ${bomb.color}`}
                            title={bomb.name}
                        >
                            {bomb.icon}
                        </button>
                    ))}
                </div>
            )}

            {isPlaying && (
                <div className="bg-fuchsia-600/90 text-white px-4 py-2 rounded-full shadow-lg animate-bounce flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-bold">{isPlaying}</span>
                </div>
            )}
        </div>
    );
}
