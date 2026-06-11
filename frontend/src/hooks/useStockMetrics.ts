import { useEffect, useState } from "react";
import type { StockMetricsResponse } from "@/types";

export function useStockMetrics() {
  const [data, setData] = useState<StockMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/data/stock_metrics.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load stock metrics (${res.status})`);
        return res.json() as Promise<StockMetricsResponse>;
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
