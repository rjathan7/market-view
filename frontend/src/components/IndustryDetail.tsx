import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIndustryScores } from "@/hooks/useIndustryScores";
import { SubScoreBar } from "@/components/SubScoreBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { healthTier, tierColorClass, arrowGlyph, arrowColorClass } from "@/lib/health";

export function IndustryDetail() {
  const { industry: industryParam } = useParams<{ industry: string }>();
  const { data, error } = useIndustryScores();

  if (error) {
    return <p className="px-4 py-8 text-sm text-rose-500">Failed to load data: {error}</p>;
  }

  if (!data) {
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
          <CardTitle>Health Score Breakdown</CardTitle>
          <CardDescription>
            Health Score = (0.35 × Breadth) + (0.25 × Trend) + (0.20 × Momentum) + (0.20 × Stability)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SubScoreBar label="Breadth" value={item.breadth} weight={0.35} />
          <SubScoreBar label="Trend" value={item.trend} weight={0.25} />
          <SubScoreBar label="Momentum" value={item.momentum} weight={0.2} />
          <SubScoreBar label="Stability" value={item.stability} weight={0.2} />
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
        <CardContent className="grid grid-cols-3 gap-4">
          <Stat label="Above 200-day MA" value={`${item.pct_above_ma200.toFixed(0)}%`} />
          <Stat label="Near 52-week low" value={`${item.pct_near_52w_low.toFixed(0)}%`} />
          <Stat label="Avg 1-day return" value={`${(item.avg_1d_return * 100).toFixed(2)}%`} />
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
