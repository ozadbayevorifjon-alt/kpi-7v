"use client";

import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";
import { KeyRound, Loader2, LogIn, User } from "lucide-react";

const initial: ActionResult = { ok: false, message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Login
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="masalan: aziza.k"
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Parol
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="input pl-10"
          />
        </div>
      </div>

      {state.message && !state.ok ? (
        <p className="animate-pop rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-[15px]">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
