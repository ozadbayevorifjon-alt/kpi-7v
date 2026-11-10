"use client";

import { useMemo, useState } from "react";
import { Crown, Medal, TrendingUp } from "lucide-react";
import type { RankedStudent } from "@/lib/types";
import Avatar from "@/components/Avatar";
import CategoryIcon from "@/components/CategoryIcon";
import { KPI_CATEGORIES } from "@/db/schema";

type SortMode = "overall" | "today";

export default function RankingView({ ranking, date }: { ranking: RankedStudent[]; date: string }) {
  const [mode, setMode] = useState<SortMode>("overall");

  const sorted = useMemo(() => {
    const arr = [...ranking];
    arr.sort((a, b) =>
      mode === "overall"
        ? b.overallTotal - a.overallTotal || b.todayTotal - a.todayTotal
        : b.todayTotal - a.todayTotal || b.overallTotal - a.overallTotal,
    );
    return arr;
  }, [ranking, mode]);

  const top3 = sorted.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <TrendingUp className="size-4 text-sky-400" />
          Sinf reytingi
        </h3>
        <div className="ml-auto flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {(
            [
              ["overall", "Umumiy"],
              ["today", "Tanlangan kun"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              data-active={mode === m}
              className="tab-btn px-3 py-1.5 text-xs"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {top3.length >= 3 ? (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((r, i) => {
            const value = mode === "overall" ? r.overallTotal : r.todayTotal;
            return (
              <div
                key={r.studentId}
                className={`glass-card animate-pop flex flex-col items-center p-4 text-center sm:p-5 ${
                  i === 0 ? "border-amber-400/25 bg-gradient-to-b from-amber-400/10 to-transparent" : ""
                }`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="relative">
                  <Avatar name={r.fullName} photoUrl={r.photoUrl} size={52} />
                  <span
                    className={`absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full text-[10px] font-black text-white ring-2 ring-ink-950 ${
                      i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : "bg-orange-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                </div>
                <p className="mt-3 w-full truncate text-xs font-bold text-white sm:text-sm">{r.fullName}</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-black text-gradient sm:text-xl">
                  <Crown className={`size-4 ${i === 0 ? "text-amber-400" : "text-slate-500"}`} />
                  {value}
                </p>
                <p className="text-[10px] text-slate-500">ball</p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02] text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">O'quvchi</th>
                {KPI_CATEGORIES.map((c) => (
                  <th key={c} className="px-3 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <CategoryIcon category={c} className="size-3.5" />
                      <span className="hidden lg:inline">{c === "book" ? "Kitob" : c === "discipline" ? "Intizom" : "Forma"}</span>
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center">Kun ({date.slice(8)})</th>
                <th className="px-4 py-3 text-right">Umumiy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((r) => {
                const medal = r.rank <= 3;
                return (
                  <tr key={r.studentId} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-black ${
                          medal ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white" : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {r.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.fullName} photoUrl={r.photoUrl} size={32} />
                        <span className="font-semibold text-slate-100">{r.fullName}</span>
                        {r.rank === 1 ? <Medal className="size-4 text-amber-400" /> : null}
                      </div>
                    </td>
                    {KPI_CATEGORIES.map((c) => (
                      <td key={c} className="px-3 py-3 text-center tabular-nums text-slate-300">
                        {r.today[c] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-sky-300 tabular-nums">{r.todayTotal}</span>
                      <span className="text-xs text-slate-600">/30</span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-white tabular-nums">
                      {r.overallTotal}
                    </td>
                  </tr>
                );
              })}
              {!sorted.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Hozircha ma'lumot yo'q.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
