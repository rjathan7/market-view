import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  value: number;
  colorClass: string;
  className?: string;
}

const TRACK_HEIGHT = 100;
const RADIUS = 16;

export function HealthBar({ value, colorClass, className }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <svg
      viewBox={`0 0 100 ${TRACK_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-2.5 w-full overflow-visible", colorClass, className)}
    >
      <Group>
        <Bar
          x={0}
          y={0}
          width={100}
          height={TRACK_HEIGHT}
          rx={RADIUS}
          className="fill-muted"
        />
        <Bar
          x={0}
          y={0}
          width={clamped}
          height={TRACK_HEIGHT}
          rx={RADIUS}
          fill="currentColor"
        />
      </Group>
    </svg>
  );
}
