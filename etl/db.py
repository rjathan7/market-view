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
    return conn
