"""
One-time backfill: pulls ~2 years of daily price history for all S&P 500 stocks,
plus their GICS Sector/Sub-Industry classification, and stores everything in SQLite.

Run this once to initialize the database. After that, use daily_update.py.
"""

from io import StringIO

import pandas as pd
import requests
import yfinance as yf

from db import get_connection

BACKFILL_PERIOD = "2y"


def get_sp500_table():
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {"User-Agent": "Mozilla/5.0"}
    html = requests.get(url, headers=headers).text
    table = pd.read_html(StringIO(html))[0]
    # yfinance uses '-' instead of '.' for share classes (e.g. BRK.B -> BRK-B)
    table["Symbol"] = table["Symbol"].str.replace(".", "-", regex=False)
    return table[["Symbol", "GICS Sector", "GICS Sub-Industry"]]


def main():
    sp500 = get_sp500_table()
    tickers = sp500["Symbol"].tolist()
    print(f"Found {len(tickers)} S&P 500 tickers")

    conn = get_connection()

    conn.executemany(
        "INSERT OR REPLACE INTO stocks (ticker, sector, industry) VALUES (?, ?, ?)",
        sp500[["Symbol", "GICS Sector", "GICS Sub-Industry"]].itertuples(index=False, name=None),
    )
    conn.commit()

    print(f"Downloading {BACKFILL_PERIOD} of price history for all tickers (this may take a few minutes)...")
    data = yf.download(tickers, period=BACKFILL_PERIOD, group_by="ticker", threads=True, progress=False)

    rows = []
    for ticker in tickers:
        try:
            close = data[ticker]["Close"].dropna()
        except KeyError:
            continue
        for d, price in close.items():
            rows.append((ticker, d.strftime("%Y-%m-%d"), float(price)))

    conn.executemany(
        "INSERT OR REPLACE INTO prices (ticker, date, close) VALUES (?, ?, ?)", rows
    )
    conn.commit()
    conn.close()

    print(f"Stored {len(rows)} price rows for {len(tickers)} tickers")


if __name__ == "__main__":
    main()
