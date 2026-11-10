import { BookOpen, ShieldCheck, Shirt, type LucideIcon } from "lucide-react";
import type { KpiCategory } from "@/db/schema";

export const CATEGORY_ICON: Record<KpiCategory, LucideIcon> = {
  book: BookOpen,
  discipline: ShieldCheck,
  uniform: Shirt,
};

export const CATEGORY_COLOR: Record<KpiCategory, string> = {
  book: "#38bdf8",
  discipline: "#818cf8",
  uniform: "#34d399",
};

export const CATEGORY_TEXT: Record<KpiCategory, string> = {
  book: "text-sky-300",
  discipline: "text-indigo-300",
  uniform: "text-emerald-300",
};

export default function CategoryIcon({
  category,
  className = "size-4",
}: {
  category: KpiCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  return <Icon className={className} style={{ color: CATEGORY_COLOR[category] }} />;
}
