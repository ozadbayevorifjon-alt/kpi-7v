import "server-only";

import { db } from "@/db";
import {
  scores,
  scheduleEntries,
  students,
  users,
} from "@/db/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { todayUZ } from "@/lib/dates";
import {
  dayTotal,
  emptyDayScore,
  type DayScore,
  type HistoryDay,
  type RankedStudent,
  type StudentRow,
} from "@/lib/types";

export {
  CATEGORY_META,
  MAX_TOTAL,
  dayTotal,
  emptyDayScore,
} from "@/lib/types";
export type { DayScore, HistoryDay, RankedStudent, StudentRow } from "@/lib/types";

export async function getStudentsWithUsernames(): Promise<StudentRow[]> {
  const rows = await db
    .select({
      id: students.id,
      fullName: students.fullName,
      className: students.className,
      photoUrl: students.photoUrl,
      username: users.username,
    })
    .from(students)
    .leftJoin(users, eq(users.studentId, students.id))
    .orderBy(asc(students.fullName));
  return rows;
}

export async function getScoresByDate(date: string) {
  const rows = await db
    .select({
      studentId: scores.studentId,
      category: scores.category,
      score: scores.score,
    })
    .from(scores)
    .where(eq(scores.date, date));
  const map = new Map<number, DayScore>();
  for (const r of rows) {
    if (!map.has(r.studentId)) map.set(r.studentId, emptyDayScore());
    map.get(r.studentId)![r.category] = r.score;
  }
  return map;
}

/** Umumiy (barcha kunlar) ballar yig'indisi har bir o'quvchi uchun */
export async function getOverallTotals() {
  const rows = await db
    .select({
      studentId: scores.studentId,
      total: sql<number>`coalesce(sum(${scores.score}), 0)::int`,
      days: sql<number>`count(distinct ${scores.date})::int`,
    })
    .from(scores)
    .groupBy(scores.studentId);
  return new Map(rows.map((r) => [r.studentId, r]));
}

/** Kunlik + umumiy reyting */
export async function getRanking(date?: string): Promise<RankedStudent[]> {
  const d = date ?? todayUZ();
  const list = await getStudentsWithUsernames();
  const [dayScores, overall] = await Promise.all([getScoresByDate(d), getOverallTotals()]);
  const ranked: RankedStudent[] = list.map((s) => {
    const day = dayScores.get(s.id) ?? emptyDayScore();
    const overallTotal = overall.get(s.id)?.total ?? 0;
    return {
      studentId: s.id,
      fullName: s.fullName,
      photoUrl: s.photoUrl,
      today: day,
      todayTotal: dayTotal(day),
      overallTotal,
      rank: 0,
    };
  });
  ranked.sort(
    (a, b) =>
      b.overallTotal - a.overallTotal ||
      b.todayTotal - a.todayTotal ||
      a.fullName.localeCompare(b.fullName),
  );
  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });
  return ranked;
}

/** Bitta o'quvchining N kunlik tarixi (eng so'nggisi oxirida) */
export async function getStudentHistory(studentId: number, days = 14): Promise<HistoryDay[]> {
  const rows = await db
    .select({ date: scores.date, category: scores.category, score: scores.score })
    .from(scores)
    .where(eq(scores.studentId, studentId))
    .orderBy(desc(scores.date))
    .limit(400);
  const byDate = new Map<string, DayScore>();
  for (const r of rows) {
    if (!byDate.has(r.date)) byDate.set(r.date, emptyDayScore());
    byDate.get(r.date)![r.category] = r.score;
  }
  return [...byDate.entries()]
    .slice(0, days)
    .map(([date, s]) => ({ date, scores: s, total: dayTotal(s) }))
    .reverse();
}

/** O'quvchi profili (faqat o'z sessiyasidagi studentId orqali chaqiriladi) */
export async function getStudentById(id: number) {
  const rows = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSchedule(): Promise<Record<number, (typeof scheduleEntries.$inferSelect)[]>> {
  const rows = await db
    .select()
    .from(scheduleEntries)
    .orderBy(asc(scheduleEntries.dayOfWeek), asc(scheduleEntries.sortOrder), asc(scheduleEntries.startTime));
  const grouped: Record<number, typeof rows> = {};
  for (const r of rows) {
    (grouped[r.dayOfWeek] ??= []).push(r);
  }
  return grouped;
}

export async function getOperators() {
  return db
    .select({ id: users.id, username: users.username, category: users.category })
    .from(users)
    .where(and(eq(users.role, "operator")))
    .orderBy(asc(users.username));
}

export async function getStatsOverview() {
  const [s] = await db.select({ count: sql<number>`count(*)::int` }).from(students);
  const [sc] = await db.select({ count: sql<number>`count(*)::int` }).from(scores);
  const [avg] = await db
    .select({ value: sql<number>`coalesce(round(avg(${scores.score})), 0)::int` })
    .from(scores)
    .where(eq(scores.date, todayUZ()));
  return { students: s.count, totalScores: sc.count, todayAvg: avg.value };
}
