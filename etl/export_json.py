"""
Exports the latest snapshot from market.db to static JSON files for the
React frontend (frontend/public/data/). Run after daily_update.py.
"""

import json
from pathlib import Path

import pandas as pd

from db import get_connection

OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"

# Thresholds (percentage points) for momentum vs. trend comparison,
# used to power the ranking row's direction arrows
ACCELERATING_THRESHOLD = 15
RISING_THRESHOLD = 2


def trend_arrow(trend: float, momentum: float) -> str:
    diff = momentum - trend
    if diff > ACCELERATING_THRESHOLD:
        return "accelerating"
    if diff > RISING_THRESHOLD:
        return "rising"
    if diff < -ACCELERATING_THRESHOLD:
        return "decelerating"
    if diff < -RISING_THRESHOLD:
        return "falling"
    return "flat"


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_connection()

    latest_date = pd.read_sql(
        "SELECT MAX(date) AS date FROM industry_scores", conn
    )["date"][0]

    industry_scores = pd.read_sql(
        "SELECT * FROM industry_scores WHERE date = ? ORDER BY health_score DESC",
        conn, params=(latest_date,),
    )

    # GICS Sector for each Sub-Industry, for grouping/filtering in the UI
    sector_map = pd.read_sql("SELECT DISTINCT industry, sector FROM stocks", conn)
    industry_scores = industry_scores.merge(sector_map, on="industry", how="left")

    industry_scores["trend_arrow"] = industry_scores.apply(
        lambda r: trend_arrow(r["trend"], r["momentum"]), axis=1
    )

    industries_payload = {
        "date": latest_date,
        "industries": json.loads(industry_scores.to_json(orient="records")),
    }
    with open(OUTPUT_DIR / "industry_scores.json", "w") as f:
        json.dump(industries_payload, f, indent=2)

    stock_metrics = pd.read_sql("SELECT * FROM stock_metrics ORDER BY industry, ticker", conn)
    stocks_payload = {
        "date": latest_date,
        "stocks": json.loads(stock_metrics.to_json(orient="records")),
    }
    with open(OUTPUT_DIR / "stock_metrics.json", "w") as f:
        json.dump(stocks_payload, f, indent=2)

    conn.close()
    print(f"Exported {len(industry_scores)} industries and {len(stock_metrics)} stocks to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
