"use client";

import { KPI_CATEGORIES } from "@/db/schema";
import { CATEGORY_META, type HistoryDay } from "@/lib/types";
import CategoryIcon, { CATEGORY_COLOR } from "@/components/CategoryIcon";
import { formatDateUZ } from "@/lib/dates";

export default function HistoryChart({ history }: { history: HistoryDay[] }) {
  if (!history.length) {
    return (
      <p className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-500">
        Hozircha baholar kiritilmagan.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2.5">
        {history.map((d, i) => {
          const isLast = i === history.length - 1;
          return (
            <div key={d.date} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className="flex w-full flex-col-reverse justify-start overflow-hidden rounded-t-md"
                title={`${formatDateUZ(d.date)} — jami ${d.total}/30`}
                style={{ height: "85%" }}
              >
                <div className="flex h-full flex-col justify-end gap-px">
                  {KPI_CATEGORIES.map((c) => {
                    const v = d.scores[c] ?? 0;
                    return (
                      <div
                        key={c}
                        className="anim-bar w-full"
                        style={{
                          height: `${(v / 30) * 100}%`,
                          background: CATEGORY_COLOR[c],
                          animationDelay: `${i * 40}ms`,
                          opacity: v ? 0.92 : 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className={`mt-1.5 text-center text-[10px] font-semibold leading-none ${isLast ? "text-sky-300" : "text-slate-500"}`}>
                {d.date.slice(8)}
                <span className="block text-[9px] font-normal text-slate-600">
                  {d.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/5 pt-3">
        {KPI_CATEGORIES.map((c) => (
          <span key={c} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <CategoryIcon category={c} className="size-3.5" />
            {CATEGORY_META[c].short}
          </span>
        ))}
        <span className="ml-auto text-xs text-slate-600">Ustunda: kun / jami ball</span>
      </div>
    </div>
  );
}
