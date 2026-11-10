import { GraduationCap, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import { CATEGORY_META } from "@/lib/data";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  operator: "Operator",
  student: "O'quvchi",
};

export default function TopBar({ user }: { user: SessionUser }) {
  const roleLabel =
    user.role === "operator" && user.category
      ? `${CATEGORY_META[user.category].short} operatori`
      : ROLE_LABEL[user.role];

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-600/30">
          <GraduationCap className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-tight text-white">
            7-V sinf KPI
          </p>
          <p className="hidden text-[11px] text-slate-500 sm:block">
            Kunlik baholash tizimi
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="chip max-w-45 sm:max-w-none">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{user.username}</span>
            <span className="text-slate-500">·</span>
            <span className="text-sky-300">{roleLabel}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn-ghost px-3 py-2"
              title="Chiqish"
              aria-label="Chiqish"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
