import { useState } from "react";
import { Search, Info } from "lucide-react";
import { useIndustryScores } from "@/hooks/useIndustryScores";
import { IndustryRow } from "@/components/IndustryRow";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function IndustryRanking() {
  const { data, error } = useIndustryScores();
  const [search, setSearch] = useState("");

  if (error) {
    return <p className="px-4 py-8 text-sm text-rose-500">Failed to load data: {error}</p>;
  }

  if (!data) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">Loading...</p>;
  }

  const query = search.trim().toLowerCase();
  const ranked = data.industries.map((industry, i) => ({ industry, rank: i + 1 }));
  const filtered = query
    ? ranked.filter(
        ({ industry }) =>
          industry.industry.toLowerCase().includes(query) || industry.sector.toLowerCase().includes(query),
      )
    : ranked;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">S&amp;P 500 Industry Health Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.industries.length} industries, ranked by Health Score · {data.date}
        </p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by industry or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>
      <div className="grid grid-cols-[2.5rem_1fr_8rem_3.5rem_2rem] gap-4 border-b px-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span>#</span>
        <span>Industry</span>
        <span className="flex items-center gap-1">
          Health
          <Popover>
            <PopoverTrigger
              aria-label="What is the Health Score?"
              className="normal-case text-muted-foreground transition-colors hover:text-foreground"
            >
              <Info className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm font-normal normal-case tracking-normal text-foreground">
              The Health Score (0–100) blends four sub-scores (breadth, trend, momentum, and stability) into a
              single measure of an industry's current condition. It's descriptive, not predictive. Click an
              industry for a full breakdown.
            </PopoverContent>
          </Popover>
        </span>
        <span className="text-right">Score</span>
        <span className="text-center">Trend</span>
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground">No industries match "{search}"</p>
      ) : (
        <div className="divide-y divide-border/50">
          {filtered.map(({ industry, rank }) => (
            <IndustryRow key={industry.industry} rank={rank} data={industry} />
          ))}
        </div>
      )}
    </div>
  );
}
