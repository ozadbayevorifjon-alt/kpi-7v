"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarPlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { ScheduleEntry } from "@/db/schema";
import {
  deleteScheduleEntryAction,
  saveScheduleEntryAction,
  type ActionResult,
} from "@/lib/actions";
import { DAY_NAMES } from "@/lib/dates";
import Modal from "@/components/Modal";

const initial: ActionResult = { ok: false, message: "" };

function Message({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return (
    <p
      className={`animate-pop rounded-xl border px-4 py-2.5 text-sm font-medium ${
        state.ok
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/25 bg-rose-500/10 text-rose-300"
      }`}
      role="status"
    >
      {state.message}
    </p>
  );
}

function EntryForm({
  entry,
  defaultDay,
  onClose,
}: {
  entry: ScheduleEntry | null;
  defaultDay: number;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveScheduleEntryAction, initial);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);

  return (
    <Modal open={open} onClose={onClose} title={entry ? "Darsni tahrirlash" : "Yangi dars qo'shish"}>
      <form action={formAction} className="space-y-4" key={entry?.id ?? "new"}>
        <input type="hidden" name="id" value={entry?.id ?? ""} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hafta kuni
            </label>
            <select name="dayOfWeek" defaultValue={entry?.dayOfWeek ?? defaultDay} className="input">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d} className="bg-ink-900">
                  {DAY_NAMES[d]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sana belgisi
            </label>
            <input
              name="dateLabel"
              required
              defaultValue={entry?.dateLabel ?? ""}
              placeholder="16-noyabr"
              className="input"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fan nomi
            </label>
            <input name="subject" required defaultValue={entry?.subject ?? ""} placeholder="Matematika" className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              O'qituvchi
            </label>
            <input name="teacher" required defaultValue={entry?.teacher ?? ""} placeholder="F.I.Sh." className="input" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Boshlanish
            </label>
            <input type="time" name="startTime" required defaultValue={entry?.startTime ?? "08:00"} className="input [color-scheme:dark]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tugash
            </label>
            <input type="time" name="endTime" required defaultValue={entry?.endTime ?? "08:45"} className="input [color-scheme:dark]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tartib
            </label>
            <input type="number" name="sortOrder" defaultValue={entry?.sortOrder ?? 0} className="input" />
          </div>
        </div>
        <Message state={state} />
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          Saqlash
        </button>
      </form>
    </Modal>
  );
}

function DeleteEntry({ id, subject }: { id: number; subject: string }) {
  const [state, formAction, pending] = useActionState(deleteScheduleEntryAction, initial);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`"${subject}" darsi o'chirilsinmi?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="grid size-7 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300"
        title="O'chirish"
        aria-label={state.message || "O'chirish"}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
    </form>
  );
}

export default function ScheduleManager({ schedule }: { schedule: Record<number, ScheduleEntry[]> }) {
  const [form, setForm] = useState<{ entry: ScheduleEntry | null; day: number } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold text-white">Dars jadvali boshqaruvi</h3>
        <button
          type="button"
          onClick={() => setForm({ entry: null, day: 1 })}
          className="btn-primary ml-auto"
        >
          <Plus className="size-4" />
          Dars qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const entries = schedule[d] ?? [];
          return (
            <section key={d} className="glass-card overflow-hidden">
              <header className="flex items-center gap-2.5 border-b border-white/8 bg-gradient-to-r from-blue-600/15 to-transparent px-4 py-3">
                <div>
                  <h4 className="text-sm font-bold text-white">{DAY_NAMES[d]}</h4>
                  <p className="text-[11px] text-slate-500">{entries[0]?.dateLabel ?? "—"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ entry: null, day: d })}
                  className="btn-ghost ml-auto px-2.5 py-1.5 text-xs"
                >
                  <Plus className="size-3.5" />
                  Qo'shish
                </button>
              </header>
              <ul className="divide-y divide-white/5">
                {entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-24 shrink-0 text-[11px] font-semibold tabular-nums text-sky-300/90">
                      {e.startTime}–{e.endTime}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-100">{e.subject}</p>
                      <p className="truncate text-[11px] text-slate-500">{e.teacher}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ entry: e, day: d })}
                      className="grid size-7 place-items-center rounded-lg text-slate-500 transition hover:bg-sky-500/15 hover:text-sky-300"
                      title="Tahrirlash"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <DeleteEntry id={e.id} subject={e.subject} />
                  </li>
                ))}
                {!entries.length ? (
                  <li className="px-4 py-5 text-center text-xs text-slate-600">Dars kiritilmagan</li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>

      {form ? <EntryForm entry={form.entry} defaultDay={form.day} onClose={() => setForm(null)} /> : null}
    </div>
  );
}
