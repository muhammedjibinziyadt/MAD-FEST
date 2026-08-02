"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JuryLoginFormProps {
  action: (
    state: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
}

const initialState = { error: undefined as string | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth loading={pending}>
      Enter Jury Portal
    </Button>
  );
}

export function JuryLoginForm({ action }: JuryLoginFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
    >
      <div>
        <label className="text-sm font-semibold text-white/80">
          Jury ID or Name
        </label>
        <Input
          name="identifier"
          className="mt-2"
          required
        />
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
      {state.error && (
        <p className="text-sm text-rose-400">{state.error}</p>
      )}
      <SubmitButton />
    </form>
  );
}
