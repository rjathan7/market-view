import type { IndustryScore } from "@/types";
import { HealthBar } from "@/components/HealthBar";
import { healthTier, tierColorClass, arrowGlyph, arrowColorClass } from "@/lib/health";

interface IndustryRowProps {
  rank: number;
  data: IndustryScore;
}

export function IndustryRow({ rank, data }: IndustryRowProps) {
  const tier = healthTier(data.health_score);

  return (
    <div className="grid grid-cols-[2.5rem_1fr_8rem_3.5rem_2rem] items-center gap-4 px-4 py-2.5 hover:bg-muted/50 transition-colors">
      <span className="text-sm text-muted-foreground tabular-nums">{rank}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{data.industry}</p>
        <p className="truncate text-xs text-muted-foreground">{data.sector}</p>
      </div>
      <HealthBar value={data.health_score} colorClass={tierColorClass[tier]} />
      <span className="text-right text-sm font-semibold tabular-nums text-foreground">
        {data.health_score.toFixed(1)}
      </span>
      <span className={`text-center text-base font-medium ${arrowColorClass[data.trend_arrow]}`}>
        {arrowGlyph[data.trend_arrow]}
      </span>
    </div>
  );
}
