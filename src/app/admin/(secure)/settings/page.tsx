"use client";

import { useActionState } from "react";
import { updateAdminCredentials } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: { error?: string; success?: string } = {
    error: undefined,
    success: undefined,
};

export default function SettingsPage() {
    const [state, action, isPending] = useActionState(updateAdminCredentials, initialState);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>

            <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                    <CardTitle>Admin Credentials</CardTitle>
                    <CardDescription className="text-white/60">
                        Update your admin username and password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                placeholder="Enter current password"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">New Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Enter new username"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-red-400">{state.error}</p>
                        )}
                        {state?.success && (
                            <p className="text-sm text-green-400">{state.success}</p>
                        )}

                        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                            {isPending ? "Updating..." : "Update Credentials"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
