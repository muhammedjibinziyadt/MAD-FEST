"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
          <Input name="password" type="password" className="mt-2" required />
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <SubmitButton />
      </form>
    </Card>
  );
}

