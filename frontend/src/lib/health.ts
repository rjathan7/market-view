import type { TrendArrow } from "@/types";

export type HealthTier = "strong" | "neutral" | "weak";

export function healthTier(score: number): HealthTier {
  if (score >= 70) return "strong";
  if (score >= 40) return "neutral";
  return "weak";
}

export const tierColorClass: Record<HealthTier, string> = {
  strong: "text-emerald-500 dark:text-emerald-400",
  neutral: "text-amber-500 dark:text-amber-400",
  weak: "text-rose-500 dark:text-rose-400",
};

export const arrowGlyph: Record<TrendArrow, string> = {
  accelerating: "↑↑",
  rising: "↑",
  flat: "→",
  falling: "↓",
  decelerating: "↓↓",
};

export const arrowColorClass: Record<TrendArrow, string> = {
  accelerating: "text-emerald-500 dark:text-emerald-400",
  rising: "text-emerald-500/70 dark:text-emerald-400/70",
  flat: "text-muted-foreground",
  falling: "text-rose-500/70 dark:text-rose-400/70",
  decelerating: "text-rose-500 dark:text-rose-400",
};
