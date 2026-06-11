import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import type { StockMetric } from "@/types";

interface ReturnDistributionProps {
  stocks: StockMetric[];
}

const BINS = [
  { label: "<-10%", min: -Infinity, max: -0.1 },
  { label: "-10/-5%", min: -0.1, max: -0.05 },
  { label: "-5/-2%", min: -0.05, max: -0.02 },
  { label: "-2/0%", min: -0.02, max: 0 },
  { label: "0/2%", min: 0, max: 0.02 },
  { label: "2/5%", min: 0.02, max: 0.05 },
  { label: "5/10%", min: 0.05, max: 0.1 },
  { label: ">10%", min: 0.1, max: Infinity },
];

const WIDTH = 100;
const HEIGHT = 50;

export function ReturnDistribution({ stocks }: ReturnDistributionProps) {
  const counts = BINS.map(
    (bin) => stocks.filter((s) => s.one_week_return >= bin.min && s.one_week_return < bin.max).length,
  );
  const maxCount = Math.max(1, ...counts);

  const xScale = scaleBand<number>({
    domain: BINS.map((_, i) => i),
    range: [0, WIDTH],
    padding: 0.15,
  });
  const yScale = scaleLinear<number>({
    domain: [0, maxCount],
    range: [0, HEIGHT],
  });

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-32 w-full overflow-visible">
        <Group>
          {counts.map((count, i) => {
            const barHeight = yScale(count);
            const x = xScale(i) ?? 0;
            const isPositive = BINS[i].min >= 0;
            return (
              <Bar
                key={BINS[i].label}
                x={x}
                y={HEIGHT - barHeight}
                width={xScale.bandwidth()}
                height={barHeight}
                rx={1}
                className={
                  isPositive
                    ? "fill-emerald-500/70 dark:fill-emerald-400/70"
                    : "fill-rose-500/70 dark:fill-rose-400/70"
                }
              />
            );
          })}
        </Group>
      </svg>
      <div
        className="mt-1.5 grid text-center text-[10px] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${BINS.length}, minmax(0, 1fr))` }}
      >
        {BINS.map((bin) => (
          <span key={bin.label}>{bin.label}</span>
        ))}
      </div>
    </div>
  );
}
