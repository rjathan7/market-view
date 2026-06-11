# Market View Intelligence Platform

**Live app**: [market-view-t9ks.vercel.app](https://market-view-t9ks.vercel.app/)

## Product Summary

The product is a market intelligence visualization system that does **NOT** focus on individual stocks first.

Instead, it models the stock market as a living system of industries.

The core question it answers is:

> "How healthy is each part of the market, and where is momentum flowing?"

It replaces ticker-centric exploration with a macro-to-micro hierarchy:

**Market → Industry → Stocks**

## Core Product

NOT a stock visualization tool
NOT a charting platform
NOT a screener

IS: A market structure and rotation intelligence system

It emphasizes:

- market breadth
- participation
- momentum flow
- leadership concentration
- regime shifts across industries

## Primary User Question

Instead of:

> "What is NVDA doing?"

The system answers:

> "Where is capital rotating in the market?"

## System Overview

### 1. Main Screen: Industry Health Ranking (Row View)

The homepage is a ranked list of industries, sorted by Health Score (highest to lowest). Each industry is represented as a single row.

**Visual Attributes:**

- **Bar length** → Health Score (0–100), giving an at-a-glance visual ranking
- **Color** → Health Score tier (e.g., green = strong, yellow = neutral, red = weak)
- **Number** → exact Health Score (0–100)
- **Arrow** → momentum direction change (↑ ↓ →)
- **Optional**: trend acceleration (↑↑ / ↓↓)

**Example Output:**

```
Semiconductors      ██████████  92  ↑↑
Cybersecurity       ████████    85  ↑
Energy              ██████      71  →
Solar               ██          31  ↓↓
```

**Purpose:**

Users immediately perceive:

- which industries are strong
- which are weakening
- where momentum is accelerating or fading

Each row links to that industry's Drill-Down View (Section 3), which opens with the Health Score Breakdown described below.

### 2. Core Metric: Industry Health Score (0–100)

Each industry has a computed scalar score representing overall strength.

**Inputs (computed daily, batch processing):**

- % of stocks above 50-day moving average
- % of stocks at or near 52-week highs
- 1-week industry return
- 1-month industry return
- volatility (relative to the industry's own historical baseline)
- (optional future) earnings revisions trend

**Score Definition:**

The Health Score is a weighted combination of four sub-scores, each normalized onto a 0–100 scale so they can be combined consistently.

1. **Breadth (participation)**

   ```
   Breadth = average(% stocks above MA50, % stocks near 52-week highs)
   ```

   Already on a 0–100 scale, no conversion needed.

2. **Trend strength** (slower signal)

   ```
   Trend = percentile rank of 1-month industry return vs. all other industries (0–100)
   ```

3. **Momentum** (faster signal)

   ```
   Momentum = percentile rank of 1-week industry return vs. all other industries (0–100)
   ```

   Comparing Trend vs. Momentum is what powers the "↑↑ accelerating / ↓↓ decelerating" arrows on the ranking row.

4. **Stability**

   ```
   Stability = 100 - (percentile rank of today's volatility vs. all industries, 0-100)
   ```

   Lower relative volatility = higher stability.

**Combination:**

```
Health Score = (0.35 × Breadth) + (0.25 × Trend) + (0.20 × Momentum) + (0.20 × Stability)
```

Weights are an initial baseline and may be tuned based on observed behavior over time.

**Worked Example:**

| Sub-score | Value | Weight | Contribution |
|---|---|---|---|
| Breadth   | 55 | 0.35 | 19.25 |
| Trend     | 82 | 0.25 | 20.50 |
| Momentum  | 70 | 0.20 | 14.00 |
| Stability | 40 | 0.20 | 8.00  |
| **Total** |    |      | **61.75** |

**Key Property:**

The score is **NOT predictive**: it is descriptive of current market condition.

**Rationale:**

- **Why percentile rank instead of raw values:** The raw inputs are on incompatible scales: breadth metrics are already percentages (0–100), but returns (e.g., -8% to +15%) and volatility are not. Converting returns and volatility to percentile ranks against all other industries puts every sub-score on the same 0–100 scale, so they can be combined without one input silently dominating due to units alone.
- **Why 1-month for Trend and 1-week for Momentum:** Using two different lookback windows lets the system compare a slower signal (Trend) against a faster one (Momentum) for the same industry. When Momentum is rising faster than Trend, that's an industry accelerating (↑↑); when Momentum is falling behind Trend, it's decelerating (↓↓). A single timeframe couldn't produce this comparison.
- **Why Stability inverts the volatility rank:** "Volatility expansion/contraction" on its own is ambiguous: expansion can mean either a strong breakout or a panic sell-off. Rather than guess at direction, Stability simply rewards industries with *lower relative volatility* than peers, treating calm, orderly trends as healthier than choppy ones, consistent with the score being descriptive, not predictive.
- **Why these initial weights (0.35 / 0.25 / 0.20 / 0.20):** Breadth is weighted highest because it's the core differentiator the product is built around: broad participation vs. a few stocks carrying an industry (see Distribution View). Trend and Momentum together carry meaningful weight since they capture price-based strength, while Stability acts as a smaller modifier that tempers the score for industries moving in a disorderly way. These weights are a starting point and are expected to be tuned once real data is observed.

### 3. Industry Drill-Down View

Clicking an industry on the Main Screen opens its Drill-Down View: structured intelligence, NOT charts-first UI. The view opens with the Health Score Breakdown (the four sub-scores from Section 2), each with an info popover explaining what it measures and how it's weighted.

#### 3.1 Leadership & Weakness Panel

Implemented as a single "Stocks" table: one row per stock in the industry, with price and 1-day/1-week/1-month return, plus a badge for stocks near their 52-week high or low. The table is sorted by 1-week return, so the strongest stocks (leaders, new highs) sit at the top and the weakest (laggards, breakdowns, new lows) sit at the bottom.

#### 3.2 Breadth Panel

A "Breadth Snapshot" card showing, across the industry's stocks:

- % above 50-day MA
- % above 200-day MA
- % near 52-week high
- % near 52-week low
- average 1-day return

#### Drill-Down Data Requirements

Most of this view reuses data already produced for the Health Score, with a few additions to the ETL output:

- **Per-stock output**: the `stock_metrics` table stores one row per stock (price, 1-day/1-week/1-month return, MA50 status, 52-week high/low flags), overwritten daily and exported to `stock_metrics.json`, powering the Stocks table and Distribution View.
- **MA200 addition**: `industry_scores.pct_above_ma200` and `pct_near_52w_low` give the Breadth Panel full coverage alongside the existing breadth inputs.

### 4. Key Visualization Innovation: Distribution View

Instead of listing stock performance, represent internal structure of strength.

**Example:**

Instead of:

```
NVDA +3%
AMD +2%
AVGO +1%
```

Show:

```
Industry Strength Distribution

Weak ────────▁▂▃▅████ Strong
```

**Purpose:**

Indicates whether:

- leadership is broad-based
- or concentrated in a few stocks

This is a core insight layer.

**Implementation:**

A "Return Distribution" card on the Industry Drill-Down View bins each stock's 1-week return (e.g. `<-10%`, `-10/-5%`, ... `>10%`) and renders the counts as a Visx bar chart, colored red for negative bins and green for positive bins. A single tall bar means leadership is concentrated in one bucket; spread-out bars mean it's broad-based.

## Data & Computation Model

**Data Update Frequency:**

- Daily batch processing (e.g., 6 PM)

**Data Inputs:**

- daily OHLC stock data
- stock → industry mapping
- optional: fundamentals (later stage)

**Processing Pipeline:**

```
Fetch daily data
→ compute stock-level metrics
→ aggregate by industry
→ compute health score
→ store results
```

## System Constraints

**Must be true:**

- no real-time requirement
- batch processing only
- free or low-cost data sources preferred
- compute-heavy logic moved offline (ETL)

**Avoid:**

- tick-level pricing
- real-time streaming
- high-frequency alert systems
- complex trading execution logic

## Design Principles

1. **Industries first, stocks second**: Users should not start with tickers.
2. **Structure over data**: Users should see relationships, not raw numbers.
3. **Interpretation over presentation**: The system should explain market condition, not just display it.
4. **Low cognitive load**: Users should understand market state in <10 seconds.

## Core Product Goal

To transform raw market data into a visual system of market health and rotation, enabling users to instantly understand:

- Where strength is concentrated
- Where momentum is shifting
- Whether moves are broad or narrow
- Which parts of the market are leading or weakening

## Tech Stack

### Frontend

- **Framework**: React 19 + TypeScript, built with Vite (dev server on port 3000)
- **Routing**: react-router-dom (`/` for the Main Screen, `/industry/:industry` for the Drill-Down View)
- **UI Components**: shadcn/ui (Tailwind CSS v4) for a clean, minimal aesthetic (in the spirit of Mercury / Linear / Vercel), with a light/dark theme toggle
- **Custom Visualizations**: Visx for the ranked-row Health Score bars, the sub-score breakdown bars, and the Return Distribution histogram
- **Data source**: static JSON snapshots (`industry_scores.json`, `stock_metrics.json`) exported by `etl/export_json.py` into `frontend/public/data/`; the frontend reads these directly with no backend or in-browser database

### Data Pipeline (ETL)

- **Language**: Python
- **Data Source**: yfinance for daily OHLC data, Wikipedia's S&P 500 table for the stock universe and GICS Sector/Sub-Industry mapping (no per-ticker `.info` calls needed)
- **Processing**: pandas for stock-level metrics → industry aggregation → Health Score computation
- **Pipeline structure**:
  - `backfill.py`: one-time script that pulls ~2 years of daily history for all S&P 500 stocks and stores it in SQLite
  - `daily_update.py`: recurring script that fetches only the last few days per ticker, appends to SQLite, recomputes metrics from the full stored history, and saves a dated snapshot
- **Scheduling**: `daily_update.py` runs as a daily batch job (e.g., cron or GitHub Actions) after market close

### Storage

- **SQLite** (`data/market.db`), a single file, no database server to host or manage
- Frontend reads precomputed results only, no real-time queries
- **Retention**: `daily_update.py` prunes `prices` rows older than ~2 years on every run, keeping the table size roughly constant rather than growing unbounded

**Database Schema:**

`stocks`, one row per S&P 500 stock, maps each ticker to its industry classification.

| Column | Type | Description |
|---|---|---|
| `ticker` (PK) | TEXT | Stock symbol, e.g. `NVDA` |
| `sector` | TEXT | GICS Sector (broad, ~11 categories) |
| `industry` | TEXT | GICS Sub-Industry, used for grouping in the Health Score |

`prices`, one row per stock per trading day, the raw daily close history that all metrics are computed from.

| Column | Type | Description |
|---|---|---|
| `ticker` (PK) | TEXT | Stock symbol |
| `date` (PK) | TEXT | Trading date, `YYYY-MM-DD` |
| `close` | REAL | Closing price |

`industry_scores`, one row per industry per day, the computed Health Score snapshot. This is the table the frontend ultimately reads from.

| Column | Type | Description |
|---|---|---|
| `date` (PK) | TEXT | Snapshot date, `YYYY-MM-DD` |
| `industry` (PK) | TEXT | GICS Sub-Industry |
| `num_stocks` | INTEGER | Number of stocks in this industry |
| `breadth` | REAL | Breadth sub-score (0-100) |
| `trend` | REAL | Trend sub-score (0-100) |
| `momentum` | REAL | Momentum sub-score (0-100) |
| `stability` | REAL | Stability sub-score (0-100) |
| `health_score` | REAL | Final weighted Health Score (0-100) |
| `pct_above_ma200` | REAL | % of stocks above their 200-day moving average |
| `pct_near_52w_low` | REAL | % of stocks within 5% of their 52-week low |
| `avg_1d_return` | REAL | Average 1-day return across the industry's stocks |

`stock_metrics`, one row per stock, the latest per-stock snapshot (overwritten daily). Powers the Stocks table and Distribution View.

| Column | Type | Description |
|---|---|---|
| `ticker` (PK) | TEXT | Stock symbol |
| `date` | TEXT | Snapshot date, `YYYY-MM-DD` |
| `industry` | TEXT | GICS Sub-Industry |
| `price` | REAL | Latest closing price |
| `one_day_return` | REAL | 1-day return |
| `one_week_return` | REAL | 1-week return |
| `one_month_return` | REAL | 1-month return |
| `above_ma50` | INTEGER | 1 if price > 50-day moving average |
| `near_52w_high` | INTEGER | 1 if price is within 5% of its 52-week high |
| `near_52w_low` | INTEGER | 1 if price is within 5% of its 52-week low |

- **Persistence note**: if `daily_update.py` runs via a scheduled CI job (e.g., GitHub Actions), each run starts from a fresh checkout with no memory of previous runs. `data/market.db` lives on a dedicated `data` branch (not `main`), and each run fetches it, updates it, and force-pushes a single squashed commit back to `data`. This keeps the file's history accumulated for the ETL while preventing `main`'s history from growing by the size of the database on every run.

## Deployment

The frontend is deployed on [Vercel](https://vercel.com)'s free Hobby tier:

1. Push the repo to GitHub (already connected: `rjathan7/market-view`).
2. In Vercel, click "Add New → Project" and import the GitHub repo.
3. Set **Root Directory** to `frontend` (the React app lives in a subfolder, not the repo root). Vercel then auto-detects the Vite preset with build command `npm run build` and output directory `dist`.
4. A `frontend/.npmrc` with `legacy-peer-deps=true` is required: `@visx/group`'s peer dependencies don't yet list React 19, which otherwise fails `npm install` on Vercel.
5. A `frontend/vercel.json` with a catch-all rewrite to `/index.html` is required for client-side routing (`/industry/:industry`), so direct links and page refreshes don't 404.
6. Deploy. Vercel auto-redeploys on every push to `main`, including the daily automated data-update commits, so the live site always reflects the latest `industry_scores.json` / `stock_metrics.json`.
