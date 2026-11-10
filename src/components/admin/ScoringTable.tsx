"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Save } from "lucide-react";
import type { KpiCategory } from "@/db/schema";
import { CATEGORY_META, dayTotal, type DayScore, type StudentRow } from "@/lib/types";
import { saveStudentDayAction, type ActionResult } from "@/lib/actions";
import Avatar from "@/components/Avatar";
import CategoryIcon from "@/components/CategoryIcon";
import { formatFullDateUZ } from "@/lib/dates";

const initial: ActionResult = { ok: false, message: "" };

function ScoreRow({
  student,
  date,
  categories,
  day,
}: {
  student: StudentRow;
  date: string;
  categories: KpiCategory[];
  day: DayScore;
}) {
  const [state, formAction, pending] = useActionState(saveStudentDayAction, initial);

  return (
    <form
      action={formAction}
      className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(64px,auto))_auto] sm:gap-4"
    >
      <input type="hidden" name="studentId" value={student.id} />
      <input type="hidden" name="date" value={date} />

      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={student.fullName} photoUrl={student.photoUrl} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{student.fullName}</p>
          <p className="text-[11px] text-slate-500">{student.className}</p>
        </div>
      </div>

      {/* Mobil: kategoriyalar ikkinchi qatorga o'tadi */}
      <div className="col-span-2 flex flex-wrap items-center gap-2 sm:contents">
        {categories.map((c) => (
          <label key={c} className="flex items-center gap-1.5 sm:justify-center">
            <span className="sm:hidden">
              <CategoryIcon category={c} className="size-3.5" />
            </span>
            <input
              type="number"
              name={c}
              min={0}
              max={10}
              defaultValue={day[c] ?? ""}
              placeholder="—"
              className="score-input"
              aria-label={`${student.fullName} — ${CATEGORY_META[c].label}`}
            />
          </label>
        ))}

        <div className="flex items-center gap-2 sm:justify-end">
          <span
            className="hidden w-10 text-center text-sm font-bold text-slate-300 tabular-nums sm:block"
            title="Joriy jami"
          >
            {dayTotal(day)}/30
          </span>
          <button type="submit" disabled={pending} className="btn-primary px-3 py-2" title="Saqlash">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span className="hidden md:inline">Saqlash</span>
          </button>
        </div>
      </div>

      {state.message ? (
        <p
          className={`col-span-2 text-xs font-medium sm:col-span-5 ${
            state.ok ? "text-emerald-400" : "text-rose-400"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export default function ScoringTable({
  students,
  dateScores,
  date,
  today,
  categories,
  tab,
}: {
  students: StudentRow[];
  dateScores: Record<number, DayScore>;
  date: string;
  today: string;
  categories: KpiCategory[];
  tab: string;
}) {
  const router = useRouter();
  const empty: DayScore = { book: null, discipline: null, uniform: null };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/8 px-4 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Baholash sanasi</h3>
        </div>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => {
            const v = e.target.value;
            if (v) router.replace(`/dashboard?tab=${tab}&date=${v}`);
          }}
          className="input w-auto py-1.5 text-sm [color-scheme:dark]"
        />
        <span className="chip ml-auto">{formatFullDateUZ(date)}</span>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(64px,auto))_auto] gap-4 border-b border-white/5 bg-white/[0.02] px-4 py-2.5 sm:grid">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">O'quvchi</span>
        {categories.map((c) => (
          <span key={c} className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <CategoryIcon category={c} className="size-3.5" />
            {CATEGORY_META[c].short}
          </span>
        ))}
        <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Jami</span>
      </div>

      <div className="divide-y divide-white/5">
        {students.map((s) => (
          <ScoreRow
            key={`${s.id}-${date}`}
            student={s}
            date={date}
            categories={categories}
            day={dateScores[s.id] ?? empty}
          />
        ))}
        {!students.length ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            O'quvchilar hali qo'shilmagan.
          </p>
        ) : null}
      </div>
    </div>
  );
}
