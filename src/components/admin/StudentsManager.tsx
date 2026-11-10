"use client";

import { useActionState, useEffect, useState } from "react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  createStudentAction,
  deleteStudentAction,
  updateCredentialsAction,
  updateStudentAction,
  type ActionResult,
} from "@/lib/actions";
import type { StudentRow } from "@/lib/types";
import Avatar from "@/components/Avatar";
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

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input name={name} className="input" {...rest} />
    </div>
  );
}

function AddStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createStudentAction, initial);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Yangi o'quvchi qo'shish">
      <form action={formAction} className="space-y-4">
        <Field label="To'liq ism" name="fullName" required placeholder="Masalan: Aziza Karimova" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sinf" name="className" defaultValue="7-V" required />
          <Field label="Rasm URL (ixtiyoriy)" name="photoUrl" type="url" placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Login" name="username" required placeholder="aziza.k" autoComplete="off" />
          <Field label="Parol" name="password" required placeholder="kamida 4 belgi" autoComplete="new-password" />
        </div>
        <Message state={state} />
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Qo'shish
        </button>
      </form>
    </Modal>
  );
}

function EditStudentModal({
  student,
  onClose,
}: {
  student: StudentRow | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateStudentAction, initial);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);

  return (
    <Modal open={!!student} onClose={onClose} title="O'quvchini tahrirlash">
      {student ? (
        <form action={formAction} className="space-y-4" key={student.id}>
          <input type="hidden" name="id" value={student.id} />
          <Field label="To'liq ism" name="fullName" required defaultValue={student.fullName} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sinf" name="className" required defaultValue={student.className} />
            <Field label="Rasm URL" name="photoUrl" type="url" defaultValue={student.photoUrl ?? ""} />
          </div>
          <Message state={state} />
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
            Saqlash
          </button>
        </form>
      ) : null}
    </Modal>
  );
}

function CredentialsModal({
  student,
  onClose,
}: {
  student: StudentRow | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateCredentialsAction, initial);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);

  return (
    <Modal open={!!student} onClose={onClose} title="Login va parol">
      {student ? (
        <form action={formAction} className="space-y-4" key={student.id}>
          <input type="hidden" name="studentId" value={student.id} />
          <p className="rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            <span className="font-bold text-white">{student.fullName}</span> uchun login ma'lumotlari
          </p>
          <Field label="Login" name="username" required defaultValue={student.username ?? ""} autoComplete="off" />
          <Field
            label="Yangi parol (bo'sh qoldirilsa o'zgarmaydi)"
            name="password"
            placeholder="••••••"
            autoComplete="new-password"
          />
          <Message state={state} />
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Yangilash
          </button>
        </form>
      ) : null}
    </Modal>
  );
}

function DeleteModal({
  student,
  onClose,
}: {
  student: StudentRow | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(deleteStudentAction, initial);
  useEffect(() => {
    if (state.ok) onClose();
  }, [state, onClose]);

  return (
    <Modal open={!!student} onClose={onClose} title="O'quvchini o'chirish">
      {student ? (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={student.id} />
          <p className="text-sm leading-relaxed text-slate-300">
            <span className="font-bold text-white">{student.fullName}</span> butunlay o'chiriladi:
            login akkaunti, barcha KPI baholari va tarixi qaytarib bo'lmas tarzda o'chadi.
          </p>
          <Message state={state} />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Bekor qilish
            </button>
            <button type="submit" disabled={pending} className="btn-danger">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              O'chirish
            </button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

export default function StudentsManager({ students }: { students: StudentRow[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentRow | null>(null);
  const [credTarget, setCredTarget] = useState<StudentRow | null>(null);
  const [delTarget, setDelTarget] = useState<StudentRow | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-sm font-bold text-white">
          O'quvchilar ro'yxati <span className="text-slate-500">({students.length})</span>
        </h3>
        <button type="button" onClick={() => setAddOpen(true)} className="btn-primary ml-auto">
          <UserPlus className="size-4" />
          O'quvchi qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {students.map((s, i) => (
          <article
            key={s.id}
            className="glass-card animate-fade-up p-4"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={s.fullName} photoUrl={s.photoUrl} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{s.fullName}</p>
                <p className="text-[11px] text-slate-500">
                  {s.className} · login: <span className="text-sky-300">{s.username ?? "—"}</span>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCredTarget(s)}
                className="btn-ghost px-2 py-2 text-xs"
                title="Login/parolni o'zgartirish"
              >
                <KeyRound className="size-3.5" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setEditTarget(s)}
                className="btn-ghost px-2 py-2 text-xs"
              >
                <Pencil className="size-3.5" />
                Tahrir
              </button>
              <button
                type="button"
                onClick={() => setDelTarget(s)}
                className="btn-danger px-2 py-2 text-xs"
              >
                <Trash2 className="size-3.5" />
                O'chirish
              </button>
            </div>
          </article>
        ))}
        {!students.length ? (
          <p className="glass-card col-span-full px-4 py-10 text-center text-sm text-slate-500">
            O'quvchilar hali qo'shilmagan. Yuqoridagi tugma orqali qo'shing.
          </p>
        ) : null}
      </div>

      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} />
      <CredentialsModal student={credTarget} onClose={() => setCredTarget(null)} />
      <DeleteModal student={delTarget} onClose={() => setDelTarget(null)} />
    </div>
  );
}
