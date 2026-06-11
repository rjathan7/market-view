import type { StockMetric } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatPercent, returnColorClass } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StockTableProps {
  stocks: StockMetric[];
}

export function StockTable({ stocks }: StockTableProps) {
  const sorted = [...stocks].sort((a, b) => b.one_week_return - a.one_week_return);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium">Ticker</th>
            <th className="px-2 py-1.5 text-right font-medium">Price</th>
            <th className="px-2 py-1.5 text-right font-medium">1D</th>
            <th className="px-2 py-1.5 text-right font-medium">1W</th>
            <th className="px-2 py-1.5 text-right font-medium">1M</th>
            <th className="px-2 py-1.5 text-right font-medium">52W</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {sorted.map((s) => (
            <tr key={s.ticker}>
              <td className="px-2 py-1.5 font-medium text-foreground">{s.ticker}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">${s.price.toFixed(2)}</td>
              <td className={cn("px-2 py-1.5 text-right tabular-nums", returnColorClass(s.one_day_return))}>
                {formatPercent(s.one_day_return)}
              </td>
              <td className={cn("px-2 py-1.5 text-right tabular-nums", returnColorClass(s.one_week_return))}>
                {formatPercent(s.one_week_return)}
              </td>
              <td className={cn("px-2 py-1.5 text-right tabular-nums", returnColorClass(s.one_month_return))}>
                {formatPercent(s.one_month_return)}
              </td>
              <td className="px-2 py-1.5 text-right">
                {s.near_52w_high === 1 && (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    High
                  </Badge>
                )}
                {s.near_52w_low === 1 && (
                  <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    Low
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
