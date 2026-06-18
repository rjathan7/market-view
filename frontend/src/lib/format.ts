export function formatPercent(value: number, digits = 1): string {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function returnColorClass(value: number): string {
  if (value > 0) return "text-emerald-500 dark:text-emerald-400";
  if (value < 0) return "text-rose-500 dark:text-rose-400";
  return "text-muted-foreground";
}
