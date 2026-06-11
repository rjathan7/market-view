"""Per-stock technical indicators and industry-level Health Score, per README.md."""

import numpy as np
import pandas as pd


def compute_stock_metrics(close: pd.Series):
    """Compute technical indicators for a single stock from its closing price history."""
    close = close.dropna()
    if len(close) < 50:
        return None

    current_price = close.iloc[-1]
    ma50 = close.rolling(50).mean().iloc[-1]
    ma200 = close.rolling(200).mean().iloc[-1] if len(close) >= 200 else np.nan

    week_ago = close.iloc[-6] if len(close) > 5 else close.iloc[0]
    month_ago = close.iloc[-22] if len(close) > 21 else close.iloc[0]

    one_week_return = (current_price - week_ago) / week_ago
    one_month_return = (current_price - month_ago) / month_ago

    fifty_two_week_high = close.max()
    near_52w_high = current_price >= fifty_two_week_high * 0.95

    daily_returns = close.pct_change(fill_method=None).dropna()
    volatility = daily_returns.tail(20).std()

    return {
        "above_ma50": bool(current_price > ma50),
        "above_ma200": bool(current_price > ma200) if not np.isnan(ma200) else None,
        "near_52w_high": bool(near_52w_high),
        "one_week_return": one_week_return,
        "one_month_return": one_month_return,
        "volatility": volatility,
    }


def compute_industry_health_scores(stock_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate per-stock metrics into industry-level Health Scores."""
    industry_stats = stock_df.groupby("industry").agg(
        breadth_ma50=("above_ma50", "mean"),
        breadth_near_high=("near_52w_high", "mean"),
        avg_1w_return=("one_week_return", "mean"),
        avg_1m_return=("one_month_return", "mean"),
        avg_volatility=("volatility", "mean"),
        num_stocks=("ticker", "count"),
    ).reset_index()

    industry_stats["breadth_ma50"] *= 100
    industry_stats["breadth_near_high"] *= 100
    industry_stats["breadth"] = (
        industry_stats["breadth_ma50"] + industry_stats["breadth_near_high"]
    ) / 2

    # Percentile ranks across industries
    industry_stats["trend"] = industry_stats["avg_1m_return"].rank(pct=True) * 100
    industry_stats["momentum"] = industry_stats["avg_1w_return"].rank(pct=True) * 100
    industry_stats["stability"] = 100 - industry_stats["avg_volatility"].rank(pct=True) * 100

    industry_stats["health_score"] = (
        0.35 * industry_stats["breadth"]
        + 0.25 * industry_stats["trend"]
        + 0.20 * industry_stats["momentum"]
        + 0.20 * industry_stats["stability"]
    )

    return industry_stats.sort_values("health_score", ascending=False)
