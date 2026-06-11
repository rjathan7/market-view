import { useIndustryScores } from "@/hooks/useIndustryScores";
import { IndustryRow } from "@/components/IndustryRow";

export function IndustryRanking() {
  const { data, error } = useIndustryScores();

  if (error) {
    return <p className="px-4 py-8 text-sm text-rose-500">Failed to load data: {error}</p>;
  }

  if (!data) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Industry Health Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.industries.length} industries, ranked by Health Score · {data.date}
        </p>
      </header>
      <div className="grid grid-cols-[2.5rem_1fr_8rem_3.5rem_2rem] gap-4 border-b px-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>#</span>
        <span>Industry</span>
        <span>Health</span>
        <span className="text-right">Score</span>
        <span className="text-center">Trend</span>
      </div>
      <div className="divide-y divide-border/50">
        {data.industries.map((industry, i) => (
          <IndustryRow key={industry.industry} rank={i + 1} data={industry} />
        ))}
      </div>
    </div>
  );
}
