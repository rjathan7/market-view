"""
Daily incremental update:
- Fetches the latest few days of price data for all tracked tickers (small request)
- Appends new rows to SQLite
- Recomputes per-stock metrics from full stored history
- Aggregates to industry-level Health Scores and stores today's snapshot

Run this once per day (e.g. via a scheduled job after market close).
Run backfill.py once first to initialize the database.
"""

from datetime import date, timedelta

import pandas as pd
import yfinance as yf

from db import get_connection
from metrics import compute_industry_health_scores, compute_stock_metrics

# Small buffer (not just "1d") to cover weekends/holidays/missed runs
UPDATE_PERIOD = "5d"

# Keep ~2 years of price history (matches backfill.py), drop anything older
RETENTION_DAYS = 730


def main():
    conn = get_connection()
    stocks = pd.read_sql("SELECT ticker, industry FROM stocks", conn)
    tickers = stocks["ticker"].tolist()

    if not tickers:
        print("No tickers found, run backfill.py first.")
        return

    print(f"Fetching latest {UPDATE_PERIOD} of prices for {len(tickers)} tickers...")
    data = yf.download(tickers, period=UPDATE_PERIOD, group_by="ticker", threads=True, progress=False)

    new_rows = []
    for ticker in tickers:
        try:
            close = data[ticker]["Close"].dropna()
        except KeyError:
            continue
        for d, price in close.items():
            new_rows.append((ticker, d.strftime("%Y-%m-%d"), float(price)))

    conn.executemany(
        "INSERT OR REPLACE INTO prices (ticker, date, close) VALUES (?, ?, ?)", new_rows
    )
    conn.commit()
    print(f"Upserted {len(new_rows)} price rows")

    # Prune prices older than the retention window so the table doesn't grow unbounded
    cutoff = (date.today() - timedelta(days=RETENTION_DAYS)).isoformat()
    deleted = conn.execute("DELETE FROM prices WHERE date < ?", (cutoff,)).rowcount
    conn.commit()
    print(f"Pruned {deleted} price rows older than {cutoff}")

    # Recompute per-stock metrics from full stored history
    rows = []
    for _, stock in stocks.iterrows():
        ticker = stock["ticker"]
        history = pd.read_sql(
            "SELECT date, close FROM prices WHERE ticker = ? ORDER BY date",
            conn, params=(ticker,),
        )
        close = pd.Series(history["close"].values, index=pd.to_datetime(history["date"]))

        metrics = compute_stock_metrics(close)
        if metrics is None:
            continue

        metrics["ticker"] = ticker
        metrics["industry"] = stock["industry"]
        rows.append(metrics)

    stock_df = pd.DataFrame(rows)
    print(f"Computed metrics for {len(stock_df)} / {len(tickers)} stocks")

    today = date.today().isoformat()

    # Persist per-stock snapshot (overwritten daily, used by Leadership/Weakness/Distribution views)
    stock_metric_rows = [
        (
            r["ticker"], today, r["industry"], r["price"],
            r["one_day_return"], r["one_week_return"], r["one_month_return"],
            int(r["above_ma50"]),
            int(r["above_ma200"]) if r["above_ma200"] is not None else None,
            int(r["near_52w_high"]), int(r["near_52w_low"]),
            r["volatility"],
        )
        for _, r in stock_df.iterrows()
    ]
    conn.executemany(
        """INSERT OR REPLACE INTO stock_metrics
           (ticker, date, industry, price, one_day_return, one_week_return, one_month_return,
            above_ma50, above_ma200, near_52w_high, near_52w_low, volatility)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        stock_metric_rows,
    )
    conn.commit()
    print(f"Stored per-stock metrics for {len(stock_metric_rows)} stocks")

    industry_stats = compute_industry_health_scores(stock_df)

    score_rows = [
        (
            today, r["industry"], int(r["num_stocks"]),
            r["breadth"], r["trend"], r["momentum"], r["stability"], r["health_score"],
            r["pct_above_ma200"], r["pct_near_52w_low"], r["avg_1d_return"],
        )
        for _, r in industry_stats.iterrows()
    ]
    conn.executemany(
        """INSERT OR REPLACE INTO industry_scores
           (date, industry, num_stocks, breadth, trend, momentum, stability, health_score,
            pct_above_ma200, pct_near_52w_low, avg_1d_return)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        score_rows,
    )
    conn.commit()
    conn.close()

    print(f"\nIndustry Health Scores ({today}):")
    print(
        industry_stats[
            ["industry", "num_stocks", "breadth", "trend", "momentum", "stability", "health_score"]
        ].round(1).to_string(index=False)
    )


if __name__ == "__main__":
    main()
