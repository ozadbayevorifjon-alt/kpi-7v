const TZ = "Asia/Tashkent";

/** Toshkent vaqti bo'yicha YYYY-MM-DD */
export function todayUZ(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return toDateString(d);
}

export function toDateString(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isValidDateString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

const UZ_DAYS_SHORT = ["Yak", "Du", "Se", "Chor", "Pa", "Ju", "Sha"];
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

/** "2026-11-16" -> "16-noyabr, Du" */
export function formatDateUZ(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${d}-${UZ_MONTHS[m - 1]}, ${UZ_DAYS_SHORT[wd]}`;
}

export function formatFullDateUZ(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const daysFull = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  return `${daysFull[wd]}, ${d}-${UZ_MONTHS[m - 1]} ${y}`;
}

export const DAY_NAMES: Record<number, string> = {
  1: "Dushanba",
  2: "Seshanba",
  3: "Chorshanba",
  4: "Payshanba",
  5: "Juma",
  6: "Shanba",
  7: "Yakshanba",
};
