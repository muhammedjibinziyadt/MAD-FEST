"use client";

import { useState, useEffect } from "react";
import { Poll } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash, Plus, Loader2, Edit2, PlayCircle, StopCircle, Search, BarChart2, Activity, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminPollsPage() {
    const [polls, setPolls] = useState<Poll[]>([]);

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");

    // Create State
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [creating, setCreating] = useState(false);

    // Edit State
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const res = await fetch("/api/polls");
            if (res.ok) {
                setPolls(await res.json());
            }
        } catch (error) {
            toast.error("Failed to fetch polls");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question || options.some((o) => !o.trim())) {
            toast.warning("Please fill in question and all options");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, options }),
            });

            if (res.ok) {
                toast.success("Poll created!");
                setQuestion("");
                setOptions(["", ""]);
                fetchPolls();
            } else {
                throw new Error("Failed to create");
            }
        } catch (error) {
            toast.error("Error creating poll");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this poll?")) return;
        try {
            await fetch(`/api/polls/${id}`, { method: "DELETE" });
            setPolls(polls.filter((p) => p.id !== id));
            toast.success("Poll deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleToggleStatus = async (poll: Poll) => {
        try {
            const res = await fetch(`/api/polls/${poll.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !poll.active }),
            });
            if (res.ok) {
                toast.success(`Poll ${poll.active ? 'Closed' : 'Opened'}`);
                fetchPolls();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleUpdate = async () => {
        if (!editingPoll) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/polls/${editingPoll.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: editQuestion }),
            });
            if (res.ok) {
                toast.success("Poll updated");
                setEditingPoll(null);
                fetchPolls();
            }
        } catch (error) {
            toast.error("Failed to update poll");
        } finally {
            setUpdating(false);
        }
    };

    const addOption = () => setOptions([...options, ""]);
    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        setOptions(newOpts);
    };
    const removeOption = (idx: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== idx));
    };

    // Filter Logic
    const filteredPolls = polls.filter(p => {
        const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active' ? p.active
                : !p.active;
        return matchesSearch && matchesStatus;
    });

    // Stats Logic
    const stats = {
        total: polls.length,
        active: polls.filter(p => p.active).length,
        votes: polls.reduce((acc, p) => acc + p.options.reduce((a, b) => a + b.votes, 0), 0)
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Poll Management</h1>
                    <p className="text-muted-foreground mt-1">Create engaging polls and track real-time results.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Lifetime created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Currently voting</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.votes.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Votes cast across all polls</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Create Form (Sticky) */}
                <div className="lg:col-span-1 lg:sticky lg:top-6">
                    <Card className="border-l-4 border-l-primary shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Create New Poll
                            </CardTitle>
                            <CardDescription>Ask the community a question.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Label>Question</Label>
                                    <Input
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="e.g., Who is the best artist?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Options</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-6 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Add
                                        </Button>
                                    </div>
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input
                                                value={opt}
                                                onChange={(e) => updateOption(idx, e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                            {options.length > 2 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                                                    <Trash className="w-4 h-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button type="submit" className="w-full mt-2" disabled={creating}>
                                    {creating ? <Loader2 className="animate-spin mr-2" /> : "Publish Poll"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Poll List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters */}
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search polls..."
                                    className="pl-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-background rounded-md border p-1 w-full md:w-auto overflow-x-auto">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'active', label: 'Active' },
                                    { id: 'closed', label: 'Closed' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setStatusFilter(tab.id as any)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors whitespace-nowrap ${statusFilter === tab.id
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {filteredPolls.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p>No polls found matching your criteria.</p>
                            </div>
                        ) : (
                            filteredPolls.map((poll) => {
                                const totalVotes = poll.options.reduce((a, b) => a + b.votes, 0);
                                return (
                                    <Card key={poll.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-l-4" style={{
                                        borderLeftColor: poll.active ? '#10b981' : '#f59e0b'
                                    }}>
                                        <CardContent className="p-0">
                                            <div className="p-4 md:p-6 pb-2">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <Badge tone={poll.active ? "emerald" : "amber"}>
                                                                {poll.active ? "Active" : "Closed"}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                                {totalVotes} Votes
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-lg leading-tight mt-2">{poll.question}</h3>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" title={poll.active ? "Close Poll" : "Open Poll"} onClick={() => handleToggleStatus(poll)}>
                                                            {poll.active ? <StopCircle className="w-5 h-5 text-amber-500" /> : <PlayCircle className="w-5 h-5 text-emerald-500" />}
                                                        </Button>

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => {
                                                                    setEditingPoll(poll);
                                                                    setEditQuestion(poll.question);
                                                                }}>
                                                                    <Edit2 className="w-4 h-4 text-blue-500" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader><DialogTitle>Edit Poll</DialogTitle></DialogHeader>
                                                                <div className="space-y-4 py-4">
                                                                    <div>
                                                                        <Label>Question</Label>
                                                                        <Input
                                                                            value={editQuestion}
                                                                            onChange={(e) => setEditQuestion(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">Options cannot be edited to preserve data integrity.</p>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button onClick={handleUpdate} disabled={updating}>Save Changes</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(poll.id)}>
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mt-4 mb-2">
                                                    {poll.options.map((opt) => {
                                                        const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
                                                        return (
                                                            <div key={opt.id} className="space-y-1">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="font-medium">{opt.text}</span>
                                                                    <span className="text-muted-foreground font-mono text-xs">{opt.votes} ({percentage.toFixed(1)}%)</span>
                                                                </div>
                                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full transition-all duration-500 ${poll.active ? 'bg-primary' : 'bg-slate-400'}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
