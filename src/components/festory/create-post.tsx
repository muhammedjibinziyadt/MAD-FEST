"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Send, Image as ImageIcon, Mic, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFestoryPost } from "@/app/festory/actions";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioRecorder } from "@/components/festory/audio-recorder";

const initialState: { success?: boolean; error?: string } = {};

interface CreatePostProps {
    userImage?: string;
    userName?: string;
}

export function CreatePost({ userImage, userName }: CreatePostProps) {
    const [state, formAction] = useActionState(createFestoryPost, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [content, setContent] = useState("");
    const [recorderResetKey, setRecorderResetKey] = useState(0);

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
            setSelectedImage(null);
            setAudioBlob(null);
            setContent("");
            setRecorderResetKey(prev => prev + 1);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [state]);

    // Sync Audio Blob to File Input
    useEffect(() => {
        if (audioBlob && fileInputRef.current) {
            const file = new File([audioBlob], "audio-note.mp3", { type: "audio/mp3" });
            const container = new DataTransfer();
            container.items.add(file);
            fileInputRef.current.files = container.files;
        }
    }, [audioBlob]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert("File too large (max 3MB)");
                return;
            }
            const url = URL.createObjectURL(file);
            setSelectedImage(url);
            setAudioBlob(null);
        }
    };

    const handleAudioComplete = (blob: Blob) => {
        setAudioBlob(blob);
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAudioClear = () => {
        setAudioBlob(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="bg-zinc-900 rounded-3xl p-5 border border-white/5 shadow-xl mb-6">
            <form ref={formRef} action={formAction}>
                <div className="flex gap-4 mb-4">
                    <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={userImage} className="object-cover" />
                        <AvatarFallback className="text-xs">{userName?.slice(0, 2).toUpperCase() || "ME"}</AvatarFallback>
                    </Avatar>
                    <input
                        type="text"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={selectedImage ? "Add a caption..." : audioBlob ? "Describe this audio..." : "Drop your vibe here..."}
                        className="flex-1 bg-transparent border-none text-white placeholder:text-white/30 text-base focus:ring-0 focus:outline-none py-2"
                        autoComplete="off"
                        required={!selectedImage && !audioBlob}
                    />
                </div>

                {/* Previews */}
                {selectedImage && (
                    <div className="mb-4 relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 hover:bg-red-500/80 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
                {/* Audio preview is handled by AudioRecorder component usually, but if we need custom preview we can add here. 
                     For now assuming AudioRecorder shows its own state nicely. 
                  */}

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="file"
                            accept={audioBlob ? "audio/*" : "image/*"}
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        {!audioBlob && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-full transition-colors ${selectedImage ? 'text-fuchsia-400 bg-fuchsia-500/10' : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'}`}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!!audioBlob}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        )}

                        {!selectedImage && (
                            <div className="scale-90 origin-left">
                                {/* Scale down specific recorder to fit */}
                                <AudioRecorder
                                    key={recorderResetKey}
                                    onRecordingComplete={handleAudioComplete}
                                    onClear={handleAudioClear}
                                    disabled={!!selectedImage}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Location icon for visual as per ref */}
                        {/* <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-red-400 bg-red-500/10 hover:bg-red-500/20"><MapPin className="w-4 h-4" /></Button> */}

                        <SubmitButton isValid={content.trim().length > 0 || !!selectedImage || !!audioBlob} />
                    </div>
                </div>

                <input type="hidden" name="type" value={selectedImage ? "image" : audioBlob ? "audio" : "text"} />
            </form>
            {state?.error && (
                <p className="text-red-400 text-xs mt-3">{state.error}</p>
            )}
        </div>
    );
}

function SubmitButton({ isValid }: { isValid: boolean }) {
    const { pending } = useFormStatus();
    const disabled = pending || !isValid;

    return (
        <Button
            type="submit"
            disabled={disabled}
            size="icon"
            className={`h-9 w-9 rounded-full transition-colors bg-transparent ${disabled
                ? "text-white/20"
                : "text-fuchsia-500 hover:text-fuchsia-400"
                }`}
        >
            {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Send className="h-5 w-5" />
            )}
        </Button>
    );
}
