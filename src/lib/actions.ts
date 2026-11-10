"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  scores,
  scheduleEntries,
  students,
  users,
  KPI_CATEGORIES,
  type KpiCategory,
} from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  requireRole,
  verifyPassword,
} from "@/lib/auth";
import { isValidDateString, todayUZ } from "@/lib/dates";

export type ActionResult = { ok: boolean; message: string };

const ok = (message: string): ActionResult => ({ ok: true, message });
const fail = (message: string): ActionResult => ({ ok: false, message });

function mapError(e: unknown, fallback: string): ActionResult {
  console.error(fallback, e);
  const msg = e instanceof Error ? e.message : "";
  if (msg === "UNAUTHORIZED") return fail("Sessiya tugagan. Qaytadan kiring.");
  if (msg === "FORBIDDEN") return fail("Bu amal uchun ruxsatingiz yo'q.");
  if (msg.includes("users_username_unique"))
    return fail("Bu login allaqachon band. Boshqa login tanlang.");
  return fail(`${fallback}. Iltimos, qaytadan urinib ko'ring.`);
}

/* ================= AUTH ================= */

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return fail("Login va parolni kiriting.");

  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("Login yoki parol noto'g'ri.");
  }
  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/* ================= ADMIN: O'QUVCHILAR ================= */

function cleanUsername(u: string): string {
  return u.trim().toLowerCase();
}

export async function createStudentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const fullName = String(formData.get("fullName") ?? "").trim();
    const className = String(formData.get("className") ?? "7-V").trim() || "7-V";
    const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
    const username = cleanUsername(String(formData.get("username") ?? ""));
    const password = String(formData.get("password") ?? "");

    if (fullName.length < 3) return fail("To'liq ismni kiriting.");
    if (!/^[a-z0-9._-]{3,32}$/.test(username))
      return fail("Login 3-32 belgi: kichik harf, raqam, nuqta, tire.");
    if (password.length < 4) return fail("Parol kamida 4 belgi bo'lishi kerak.");

    await db.transaction(async (tx) => {
      const [st] = await tx
        .insert(students)
        .values({ fullName, className, photoUrl })
        .returning();
      await tx.insert(users).values({
        username,
        passwordHash: hashPassword(password),
        role: "student",
        studentId: st.id,
      });
    });
    revalidatePath("/dashboard");
    return ok(`${fullName} muvaffaqiyatli qo'shildi.`);
  } catch (e) {
    return mapError(e, "O'quvchini qo'shib bo'lmadi");
  }
}

export async function updateStudentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const id = Number(formData.get("id"));
    const fullName = String(formData.get("fullName") ?? "").trim();
    const className = String(formData.get("className") ?? "7-V").trim() || "7-V";
    const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
    if (!id || fullName.length < 3) return fail("Ma'lumotlar to'liq emas.");
    await db.update(students).set({ fullName, className, photoUrl }).where(eq(students.id, id));
    revalidatePath("/dashboard");
    return ok("O'quvchi ma'lumotlari yangilandi.");
  } catch (e) {
    return mapError(e, "Yangilab bo'lmadi");
  }
}

export async function updateCredentialsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const studentId = Number(formData.get("studentId"));
    const username = cleanUsername(String(formData.get("username") ?? ""));
    const password = String(formData.get("password") ?? "");
    if (!studentId) return fail("O'quvchi tanlanmagan.");
    if (!/^[a-z0-9._-]{3,32}$/.test(username))
      return fail("Login 3-32 belgi: kichik harf, raqam, nuqta, tire.");

    const update: Partial<typeof users.$inferInsert> = { username };
    if (password) {
      if (password.length < 4) return fail("Parol kamida 4 belgi bo'lishi kerak.");
      update.passwordHash = hashPassword(password);
    }
    await db.update(users).set(update).where(eq(users.studentId, studentId));
    revalidatePath("/dashboard");
    return ok("Login/parol yangilandi.");
  } catch (e) {
    return mapError(e, "Login/parolni yangilab bo'lmadi");
  }
}

export async function deleteStudentAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const id = Number(formData.get("id"));
    if (!id) return fail("O'quvchi tanlanmagan.");
    // ON DELETE CASCADE: login akkaunti va baholari ham o'chadi
    await db.delete(students).where(eq(students.id, id));
    revalidatePath("/dashboard");
    return ok("O'quvchi va uning akkaunti o'chirildi.");
  } catch (e) {
    return mapError(e, "O'chirib bo'lmadi");
  }
}

/* ================= KPI BAHOLASH ================= */

export async function saveStudentDayAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireRole("admin", "operator");
    const studentId = Number(formData.get("studentId"));
    const date = String(formData.get("date") ?? todayUZ());
    if (!studentId || !isValidDateString(date)) return fail("Noto'g'ri so'rov.");

    const targets: KpiCategory[] =
      session.role === "operator" && session.category ? [session.category] : KPI_CATEGORIES;

    let saved = 0;
    for (const category of targets) {
      const raw = formData.get(category);
      if (raw === null || raw === "") continue;
      const score = Number(raw);
      if (!Number.isInteger(score) || score < 0 || score > 10)
        return fail("Ball 0 dan 10 gacha bo'lishi kerak.");
      await db
        .insert(scores)
        .values({ studentId, date, category, score, gradedBy: session.id, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [scores.studentId, scores.date, scores.category],
          set: { score, gradedBy: session.id, updatedAt: new Date() },
        });
      saved++;
    }
    if (!saved) return fail("Hech qanday ball kiritilmadi.");
    revalidatePath("/dashboard");
    return ok("Baholar saqlandi.");
  } catch (e) {
    return mapError(e, "Baholarni saqlab bo'lmadi");
  }
}

/* ================= DARS JADVALI ================= */

export async function saveScheduleEntryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const id = Number(formData.get("id")) || null;
    const dayOfWeek = Number(formData.get("dayOfWeek"));
    const dateLabel = String(formData.get("dateLabel") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const teacher = String(formData.get("teacher") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();
    const sortOrder = Number(formData.get("sortOrder") ?? 0);

    if (!(dayOfWeek >= 1 && dayOfWeek <= 7)) return fail("Kun tanlanmagan.");
    if (!subject || !teacher || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime))
      return fail("Fan, o'qituvchi va vaqtlarni (SS:MM) to'ldiring.");
    if (!dateLabel) return fail("Sana belgisini kiriting (masalan, 16-noyabr).");

    const values = { dayOfWeek, dateLabel, subject, teacher, startTime, endTime, sortOrder };
    if (id) {
      await db.update(scheduleEntries).set(values).where(eq(scheduleEntries.id, id));
    } else {
      await db.insert(scheduleEntries).values(values);
    }
    revalidatePath("/dashboard");
    return ok(id ? "Dars yangilandi." : "Dars jadvalga qo'shildi.");
  } catch (e) {
    return mapError(e, "Jadvalni saqlab bo'lmadi");
  }
}

export async function deleteScheduleEntryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const id = Number(formData.get("id"));
    if (!id) return fail("Dars tanlanmagan.");
    await db.delete(scheduleEntries).where(eq(scheduleEntries.id, id));
    revalidatePath("/dashboard");
    return ok("Dars jadvaldan o'chirildi.");
  } catch (e) {
    return mapError(e, "O'chirib bo'lmadi");
  }
}
