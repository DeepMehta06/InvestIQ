from pathlib import Path

import pandas as pd
import yfinance as yf

from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)


def fetch_prices(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> pd.DataFrame:
    """Fetch and cache adjusted closing prices for a list of tickers.

    Args:
        tickers: List of Yahoo Finance ticker symbols, e.g. ['AAPL', 'MSFT'].
        start_date: Start date string in YYYY-MM-DD format.
        end_date: End date string in YYYY-MM-DD format.

    Returns:
        DataFrame of adjusted closing prices, shape (trading_days, n_tickers).
        Index is DatetimeIndex. Columns are ticker symbols.

    Raises:
        ValueError: If any ticker has fewer than settings.min_history_days of data.
    """
    settings.cache_dir.mkdir(exist_ok=True)
    cache_key = f"{'_'.join(sorted(tickers))}_{start_date}_{end_date}.parquet"
    cache_path = settings.cache_dir / cache_key

    if cache_path.exists():
        logger.info("Loading prices from cache: %s", cache_key)
        return pd.read_parquet(cache_path)

    logger.info(
        "Fetching prices from yfinance: %s (%s to %s)", tickers, start_date, end_date
    )
    raw = yf.download(
        tickers, start=start_date, end=end_date, auto_adjust=True, progress=False
    )

    if isinstance(raw.columns, pd.MultiIndex):
        prices = raw["Close"]
    else:
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})

    prices = prices.dropna(how="all").ffill()

    for ticker in tickers:
        if (
            ticker not in prices.columns
            or prices[ticker].dropna().shape[0] < settings.min_history_days
        ):
            raise ValueError(
                f"Insufficient data: {ticker} has fewer than "
                f"{settings.min_history_days} trading days in the selected range."
            )

    prices.to_parquet(cache_path)
    logger.info("Prices cached: %s", cache_key)
    return prices


def compute_log_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """Compute daily log returns from a price DataFrame.

    Args:
        prices: DataFrame of adjusted closing prices, shape (days, n_assets).

    Returns:
        DataFrame of log returns, shape (days-1, n_assets). First row dropped.
    """
    import numpy as np

    returns = np.log(prices / prices.shift(1)).dropna()
    logger.info("Computed log returns — shape: %s", returns.shape)
    return returns
