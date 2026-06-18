"""SQLite schema and connection helper."""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "market.db"


def get_connection():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS stocks (
            ticker TEXT PRIMARY KEY,
            sector TEXT,
            industry TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS prices (
            ticker TEXT,
            date TEXT,
            close REAL,
            PRIMARY KEY (ticker, date)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS industry_scores (
            date TEXT,
            industry TEXT,
            num_stocks INTEGER,
            breadth REAL,
            trend REAL,
            momentum REAL,
            stability REAL,
            health_score REAL,
            PRIMARY KEY (date, industry)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS stock_metrics (
            ticker TEXT PRIMARY KEY,
            date TEXT,
            industry TEXT,
            price REAL,
            one_day_return REAL,
            one_week_return REAL,
            one_month_return REAL,
            above_ma50 INTEGER,
            near_52w_high INTEGER,
            near_52w_low INTEGER
        )
    """)

    # Migrations: add columns to industry_scores for existing databases
    existing_cols = {row[1] for row in conn.execute("PRAGMA table_info(industry_scores)").fetchall()}
    for column in ("pct_above_ma200", "pct_near_52w_low", "avg_1d_return"):
        if column not in existing_cols:
            conn.execute(f"ALTER TABLE industry_scores ADD COLUMN {column} REAL")

    # Migrations: drop unused columns from stock_metrics for existing databases
    existing_stock_metrics_cols = {row[1] for row in conn.execute("PRAGMA table_info(stock_metrics)").fetchall()}
    for column in ("above_ma200", "volatility"):
        if column in existing_stock_metrics_cols:
            conn.execute(f"ALTER TABLE stock_metrics DROP COLUMN {column}")

    return conn
