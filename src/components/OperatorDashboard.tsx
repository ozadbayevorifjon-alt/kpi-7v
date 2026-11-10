"use client";

import type { KpiCategory } from "@/db/schema";
import { CATEGORY_META, type DayScore, type StudentRow } from "@/lib/types";
import ScoringTable from "@/components/admin/ScoringTable";
import CategoryIcon from "@/components/CategoryIcon";
import { Lock } from "lucide-react";

export default function OperatorDashboard({
  category,
  students,
  dateScores,
  date,
  today,
}: {
  category: KpiCategory;
  students: StudentRow[];
  dateScores: Record<number, DayScore>;
  date: string;
  today: string;
}) {
  const meta = CATEGORY_META[category];

  return (
    <div className="space-y-5">
      <div className="glass-card animate-fade-up flex flex-wrap items-center gap-4 p-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          <CategoryIcon category={category} className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-white">
            {meta.label} — operator paneli
          </h2>
          <p className="text-sm text-slate-400">
            Har bir o'quvchini 0 dan 10 ballgacha baholang. Baholar tanlangan kunga saqlanadi.
          </p>
        </div>
        <span className="chip shrink-0">
          <Lock className="size-3.5 text-slate-500" />
          Faqat "{meta.short}" yo'nalishi
        </span>
      </div>

      <ScoringTable
        students={students}
        dateScores={dateScores}
        date={date}
        today={today}
        categories={[category]}
        tab="baholash"
      />
    </div>
  );
}
