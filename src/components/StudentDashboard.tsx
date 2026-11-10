import {
  Award,
  BookOpen,
  CalendarRange,
  History,
  Lock,
  ShieldCheck,
  Shirt,
  Trophy,
} from "lucide-react";
import { KPI_CATEGORIES, type ScheduleEntry, type Student } from "@/db/schema";
import {
  CATEGORY_META,
  MAX_TOTAL,
  dayTotal,
  type DayScore,
  type HistoryDay,
} from "@/lib/data";
import Avatar from "@/components/Avatar";
import CategoryIcon from "@/components/CategoryIcon";
import HistoryChart from "@/components/HistoryChart";
import ProgressRing from "@/components/ProgressRing";
import ScheduleView from "@/components/ScheduleView";
import { formatDateUZ, formatFullDateUZ, todayUZ } from "@/lib/dates";

const CAT_ICON_MAP = { book: BookOpen, discipline: ShieldCheck, uniform: Shirt } as const;

type Props = {
  student: Student;
  todayScores: DayScore;
  rank: number;
  totalStudents: number;
  overallTotal: number;
  history: HistoryDay[];
  schedule: Record<number, ScheduleEntry[]>;
};

export default function StudentDashboard({
  student,
  todayScores,
  rank,
  totalStudents,
  overallTotal,
  history,
  schedule,
}: Props) {
  const today = todayUZ();
  const total = dayTotal(todayScores);
  const pastDays = [...history].reverse();

  return (
    <div className="space-y-6">
      {/* Profil */}
      <section className="glass-card animate-fade-up relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <Avatar name={student.fullName} photoUrl={student.photoUrl} size={92} className="ring-4 ring-white/10" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Shaxsiy kabinet · {formatFullDateUZ(today)}
            </p>
            <h1 className="mt-1.5 truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
              {student.fullName}
            </h1>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="chip">{student.className}</span>
              <span className="chip border-amber-400/25 text-amber-300">
                <Trophy className="size-3.5" />
                Reytingda {rank}-o'rin / {totalStudents}
              </span>
              <span className="chip text-sky-300">
                <Award className="size-3.5" />
                Umumiy: {overallTotal} ball
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <ProgressRing value={total} max={MAX_TOTAL} sublabel="Bugungi natija" />
          </div>
        </div>
      </section>

      {/* Bugungi 3 yo'nalish */}
      <section className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <CalendarRange className="size-4 text-sky-400" />
          Bugungi baholarim
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {KPI_CATEGORIES.map((c, i) => {
            const v = todayScores[c];
            const pct = v === null ? 0 : (v / 10) * 100;
            const Icon = CAT_ICON_MAP[c];
            return (
              <div
                key={c}
                className="glass-card animate-pop p-5"
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <Icon
                      className="size-5"
                      style={{ color: c === "book" ? "#38bdf8" : c === "discipline" ? "#818cf8" : "#34d399" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{CATEGORY_META[c].label}</p>
                    <p className="text-[11px] text-slate-500">0 – 10 ball</p>
                  </div>
                  <p className="text-2xl font-black tabular-nums text-white">
                    {v ?? "—"}
                    {v !== null ? <span className="text-xs font-bold text-slate-500">/10</span> : null}
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      background:
                        c === "book"
                          ? "linear-gradient(90deg,#0284c7,#38bdf8)"
                          : c === "discipline"
                            ? "linear-gradient(90deg,#4f46e5,#818cf8)"
                            : "linear-gradient(90deg,#059669,#34d399)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tarix grafigi */}
      <section className="glass-card animate-fade-up p-5 sm:p-6" style={{ animationDelay: "140ms" }}>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <History className="size-4 text-sky-400" />
          So'nggi kunlar natijalari
        </h2>
        <HistoryChart history={history} />
      </section>

      {/* Oldingi kunlar ro'yxati */}
      <section className="glass-card animate-fade-up overflow-hidden" style={{ animationDelay: "180ms" }}>
        <h2 className="border-b border-white/8 px-5 py-4 text-sm font-bold text-white">
          Kunlik natijalar tarixi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Sana</th>
                {KPI_CATEGORIES.map((c) => (
                  <th key={c} className="px-3 py-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <CategoryIcon category={c} className="size-3.5" />
                      {CATEGORY_META[c].short}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3 text-right">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pastDays.map((d) => (
                <tr key={d.date} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-medium text-slate-300">{formatDateUZ(d.date)}</td>
                  {KPI_CATEGORIES.map((c) => (
                    <td key={c} className="px-3 py-3 text-center tabular-nums text-slate-300">
                      {d.scores[c] ?? "—"}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <span className="font-black tabular-nums text-sky-300">{d.total}</span>
                    <span className="text-xs text-slate-600">/30</span>
                  </td>
                </tr>
              ))}
              {!pastDays.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Hozircha natijalar yo'q.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dars jadvali */}
      <section className="animate-fade-up" style={{ animationDelay: "220ms" }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <CalendarRange className="size-4 text-sky-400" />
          Haftalik dars jadvali
          <span className="text-xs font-medium text-slate-500">(16–22 noyabr)</span>
        </h2>
        <ScheduleView schedule={schedule} />
      </section>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-[11px] text-slate-600">
        <Lock className="size-3" />
        Sizga faqat o'zingizning ma'lumotlaringiz ko'rinadi.
      </p>
    </div>
  );
}
