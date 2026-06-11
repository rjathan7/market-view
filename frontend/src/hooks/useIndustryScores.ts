import { useEffect, useState } from "react";
import type { IndustryScoresResponse } from "@/types";

export function useIndustryScores() {
  const [data, setData] = useState<IndustryScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/data/industry_scores.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load industry scores (${res.status})`);
        return res.json() as Promise<IndustryScoresResponse>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}
