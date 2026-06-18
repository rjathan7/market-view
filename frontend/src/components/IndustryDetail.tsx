import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useIndustryScores } from "@/hooks/useIndustryScores";
import { useStockMetrics } from "@/hooks/useStockMetrics";
import { SubScoreBar } from "@/components/SubScoreBar";
import { StockTable } from "@/components/StockTable";
import { ReturnDistribution } from "@/components/ReturnDistribution";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { healthTier, tierColorClass, arrowGlyph, arrowColorClass } from "@/lib/health";

const SUB_SCORE_INFO = {
  breadth:
    "Average of the % of stocks above their 50-day moving average and the % near 52-week highs. A high score means strength is broad-based across the industry, not concentrated in a few stocks.",
  trend:
    "Percentile rank of the industry's 1-month return vs. all other industries. A slower-moving signal of overall direction.",
  momentum:
    "Percentile rank of the industry's 1-week return vs. all other industries. A faster signal: comparing it to Trend produces the ↑↑ accelerating / ↓↓ decelerating arrows on the ranking.",
  stability:
    "100 minus the percentile rank of the industry's recent volatility vs. all other industries. Lower relative volatility (calmer, more orderly price action) means a higher score.",
};

export function IndustryDetail() {
  const { industry: industryParam } = useParams<{ industry: string }>();
  const { data, error } = useIndustryScores();
  const { data: stockData, error: stockError } = useStockMetrics();

  if (error || stockError) {
    return <p className="px-4 py-8 text-sm text-rose-500">Failed to load data: {error ?? stockError}</p>;
  }

  if (!data || !stockData) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Loading...</p>;
  }

  const industryName = decodeURIComponent(industryParam ?? "");
  const index = data.industries.findIndex((d) => d.industry === industryName);
  const item = data.industries[index];

  if (!item) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <BackLink />
        <p className="mt-4 text-sm text-rose-500">Industry not found: {industryName}</p>
      </div>
    );
  }

  const tier = healthTier(item.health_score);
  const industryStocks = stockData.stocks.filter((s) => s.industry === industryName);
  const pctAboveMa50 = (industryStocks.filter((s) => s.above_ma50 === 1).length / industryStocks.length) * 100;
  const pctNear52wHigh = (industryStocks.filter((s) => s.near_52w_high === 1).length / industryStocks.length) * 100;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <BackLink />

      <header className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.sector} · Rank #{index + 1} of {data.industries.length}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{item.industry}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.num_stocks} stocks · as of {item.date}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-4xl font-semibold tabular-nums ${tierColorClass[tier]}`}>
            {item.health_score.toFixed(1)}
          </p>
          <p className={`mt-1 text-sm font-medium capitalize ${arrowColorClass[item.trend_arrow]}`}>
            {arrowGlyph[item.trend_arrow]} {item.trend_arrow}
          </p>
        </div>
      </header>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Health Score Breakdown</CardTitle>
            <Popover>
              <PopoverTrigger
                aria-label="What is the Health Score?"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Info className="size-3.5" />
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm text-foreground">
                The Health Score blends four sub-scores, each normalized to a 0–100 scale so they can be combined
                consistently. It describes the industry's current condition; it is not a prediction of future
                performance. Tap the info icon next to each sub-score below for details.
              </PopoverContent>
            </Popover>
          </div>
          <CardDescription>
            Health Score = (0.35 × Breadth) + (0.25 × Trend) + (0.20 × Momentum) + (0.20 × Stability)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SubScoreBar label="Breadth" value={item.breadth} weight={0.35} description={SUB_SCORE_INFO.breadth} />
          <SubScoreBar label="Trend" value={item.trend} weight={0.25} description={SUB_SCORE_INFO.trend} />
          <SubScoreBar label="Momentum" value={item.momentum} weight={0.2} description={SUB_SCORE_INFO.momentum} />
          <SubScoreBar label="Stability" value={item.stability} weight={0.2} description={SUB_SCORE_INFO.stability} />
          <div className="mt-2 flex items-center justify-between border-t pt-3 text-sm font-semibold text-foreground">
            <span>Health Score</span>
            <span className="tabular-nums">{item.health_score.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Breadth Snapshot</CardTitle>
          <CardDescription>Participation across the industry's {item.num_stocks} stocks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Above 50-day MA" value={`${pctAboveMa50.toFixed(0)}%`} />
          <Stat label="Above 200-day MA" value={`${item.pct_above_ma200.toFixed(0)}%`} />
          <Stat label="Near 52-week high" value={`${pctNear52wHigh.toFixed(0)}%`} />
          <Stat label="Near 52-week low" value={`${item.pct_near_52w_low.toFixed(0)}%`} />
          <Stat label="Avg 1-day return" value={`${(item.avg_1d_return * 100).toFixed(2)}%`} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Stocks</CardTitle>
          <CardDescription>Sorted by 1-week return: leaders at top, laggards at bottom</CardDescription>
        </CardHeader>
        <CardContent>
          <StockTable stocks={industryStocks} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Return Distribution</CardTitle>
          <CardDescription>
            1-week return distribution across the industry's {item.num_stocks} stocks. A single tall bar means
            leadership is concentrated; spread-out bars mean it's broad-based
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReturnDistribution stocks={industryStocks} />
        </CardContent>
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to ranking
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
