import { HealthBar } from "@/components/HealthBar";

interface SubScoreBarProps {
  label: string;
  value: number;
  weight: number;
}

export function SubScoreBar({ label, value, weight }: SubScoreBarProps) {
  const contribution = value * weight;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{(weight * 100).toFixed(0)}% weight</p>
      </div>
      <HealthBar value={value} colorClass="text-sky-500 dark:text-sky-400" className="h-2" />
      <span className="w-12 text-right text-sm font-semibold tabular-nums text-foreground">
        {value.toFixed(1)}
      </span>
      <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
        +{contribution.toFixed(1)}
      </span>
    </div>
  );
}
