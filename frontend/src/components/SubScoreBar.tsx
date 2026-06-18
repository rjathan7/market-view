import { Info } from "lucide-react";
import { HealthBar } from "@/components/HealthBar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SubScoreBarProps {
  label: string;
  value: number;
  weight: number;
  description: string;
}

export function SubScoreBar({ label, value, weight, description }: SubScoreBarProps) {
  const contribution = value * weight;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <Popover>
            <PopoverTrigger
              aria-label={`What is ${label}?`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm text-foreground">{description}</PopoverContent>
          </Popover>
        </div>
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
