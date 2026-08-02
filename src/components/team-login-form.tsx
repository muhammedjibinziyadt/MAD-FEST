"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LoginState {
  error?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      Sign in
    </Button>
  );
}

export function TeamLoginForm({
  action,
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/5 p-8 text-white rounded-3xl backdrop-blur-2xl">
      <CardTitle className="text-2xl font-bold">Team Login</CardTitle>
      <CardDescription className="mt-2 text-white/70">
        Enter your team name and password to access the portal.
      </CardDescription>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-white/80">Team Name</label>
          <Input name="teamName" className="mt-2" required />
        </div>
        <div>
          <label className="text-sm font-semibold text-white/80">Password</label>
          <div className="relative mt-2">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}
