import { KPI_CATEGORIES, type KpiCategory } from "@/db/schema";

export const CATEGORY_META: Record<
  KpiCategory,
  { label: string; short: string; max: number }
> = {
  book: { label: "Kitob olib kelish", short: "Kitob", max: 10 },
  discipline: { label: "Intizom", short: "Intizom", max: 10 },
  uniform: { label: "Maktab formasi", short: "Forma", max: 10 },
};

export const MAX_TOTAL = 30;

export type DayScore = Record<KpiCategory, number | null>;

export function emptyDayScore(): DayScore {
  return { book: null, discipline: null, uniform: null };
}

export function dayTotal(d: DayScore): number {
  return KPI_CATEGORIES.reduce((acc, c) => acc + (d[c] ?? 0), 0);
}

export type StudentRow = {
  id: number;
  fullName: string;
  className: string;
  photoUrl: string | null;
  username: string | null;
};

export type RankedStudent = {
  studentId: number;
  fullName: string;
  photoUrl: string | null;
  today: DayScore;
  todayTotal: number;
  overallTotal: number;
  rank: number;
};

export type HistoryDay = {
  date: string;
  scores: DayScore;
  total: number;
};
