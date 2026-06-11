export type TrendArrow = "accelerating" | "rising" | "flat" | "falling" | "decelerating";

export interface IndustryScore {
  date: string;
  industry: string;
  sector: string;
  num_stocks: number;
  breadth: number;
  trend: number;
  momentum: number;
  stability: number;
  health_score: number;
  pct_above_ma200: number;
  pct_near_52w_low: number;
  avg_1d_return: number;
  trend_arrow: TrendArrow;
}

export interface IndustryScoresResponse {
  date: string;
  industries: IndustryScore[];
}

export interface StockMetric {
  ticker: string;
  date: string;
  industry: string;
  price: number;
  one_day_return: number;
  one_week_return: number;
  one_month_return: number;
  above_ma50: number;
  above_ma200: number | null;
  near_52w_high: number;
  near_52w_low: number;
  volatility: number;
}

export interface StockMetricsResponse {
  date: string;
  stocks: StockMetric[];
}
