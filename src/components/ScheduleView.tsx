import type { ScheduleEntry } from "@/db/schema";
import { DAY_NAMES } from "@/lib/dates";
import { CalendarDays, Clock } from "lucide-react";

type Props = {
  schedule: Record<number, ScheduleEntry[]>;
  compact?: boolean;
};

export default function ScheduleView({ schedule }: Props) {
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {days.map((d, i) => {
        const entries = schedule[d] ?? [];
        const dateLabel = entries[0]?.dateLabel;
        return (
          <section
            key={d}
            className="glass-card animate-fade-up overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <header className="flex items-center gap-2.5 border-b border-white/8 bg-gradient-to-r from-blue-600/15 to-transparent px-4 py-3">
              <CalendarDays className="size-4 shrink-0 text-sky-400" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-white">{DAY_NAMES[d]}</h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {dateLabel ?? "Dars kiritilmagan"}
                </p>
              </div>
              <span className="chip ml-auto shrink-0">{entries.length} dars</span>
            </header>

            {entries.length ? (
              <ul className="divide-y divide-white/5">
                {entries.map((e, idx) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.03]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/5 text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-100">{e.subject}</p>
                      <p className="truncate text-[11px] text-slate-500">{e.teacher}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-sky-300/90">
                      <Clock className="size-3" />
                      {e.startTime}–{e.endTime}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-xs text-slate-600">Bu kunga dars qo'shilmagan</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
