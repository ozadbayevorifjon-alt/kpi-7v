"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  GraduationCap,
  LayoutList,
  Trophy,
  Users,
} from "lucide-react";
import type { ScheduleEntry } from "@/db/schema";
import type { DayScore, RankedStudent, StudentRow } from "@/lib/types";
import { KPI_CATEGORIES } from "@/db/schema";
import ScoringTable from "@/components/admin/ScoringTable";
import RankingView from "@/components/admin/RankingView";
import StudentsManager from "@/components/admin/StudentsManager";
import ScheduleManager from "@/components/admin/ScheduleManager";
import CategoryIcon from "@/components/CategoryIcon";

type Props = {
  tab: string;
  date: string;
  today: string;
  students: StudentRow[];
  ranking: RankedStudent[];
  dateScores: Record<number, DayScore>;
  schedule: Record<number, ScheduleEntry[]>;
  stats: { students: number; totalScores: number; todayAvg: number };
  operators: { id: number; username: string; category: string | null }[];
};

const TABS = [
  { id: "baholash", label: "Baholash", icon: ClipboardList },
  { id: "reyting", label: "Reyting", icon: Trophy },
  { id: "oquvchilar", label: "O'quvchilar", icon: Users },
  { id: "jadval", label: "Dars jadvali", icon: LayoutList },
] as const;

export default function AdminDashboard(props: Props) {
  const router = useRouter();
  const { tab, date } = props;

  const setTab = (t: string) => router.replace(`/dashboard?tab=${t}&date=${date}`);

  const statCards = [
    { icon: Users, label: "O'quvchilar", value: props.stats.students, tint: "text-sky-300" },
    { icon: Activity, label: "Jami baholar", value: props.stats.totalScores, tint: "text-indigo-300" },
    { icon: ClipboardList, label: "Bugungi o'rtacha", value: `${props.stats.todayAvg}/10`, tint: "text-emerald-300" },
    { icon: GraduationCap, label: "Operatorlar", value: props.operators.length, tint: "text-blue-300" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className="glass-card animate-fade-up flex items-center gap-3 p-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <s.icon className={`size-5 ${s.tint}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-black tabular-nums text-white">{s.value}</p>
              <p className="truncate text-[11px] font-medium text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Operator akkauntlari:</span>
        {props.operators.map((op) => (
          <span key={op.id} className="chip">
            <span className="size-1.5 rounded-full bg-sky-400" />
            {op.username}
            <span className="text-slate-500">·</span>
            <span className="text-sky-300">
              {op.category === "book" ? "Kitob" : op.category === "discipline" ? "Intizom" : "Forma"}
            </span>
          </span>
        ))}
      </div>

      <nav className="glass-card flex flex-wrap gap-1 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            data-active={tab === t.id}
            className="tab-btn flex-1 justify-center sm:flex-none"
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "baholash" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {KPI_CATEGORIES.map((c) => (
              <span key={c} className="chip">
                <CategoryIcon category={c} className="size-3.5" />
                {c === "book" ? "Kitob olib kelish" : c === "discipline" ? "Intizom" : "Maktab formasi"}
                <span className="text-slate-500">· 0–10</span>
              </span>
            ))}
            <span className="chip ml-auto border-sky-500/30 text-sky-300">Admin barcha yo'nalishlarni baholaydi</span>
          </div>
          <ScoringTable
            students={props.students}
            dateScores={props.dateScores}
            date={date}
            today={props.today}
            categories={[...KPI_CATEGORIES]}
            tab={tab}
          />
        </div>
      ) : null}

      {tab === "reyting" ? <RankingView ranking={props.ranking} date={date} /> : null}

      {tab === "oquvchilar" ? <StudentsManager students={props.students} /> : null}

      {tab === "jadval" ? <ScheduleManager schedule={props.schedule} /> : null}
    </div>
  );
}
