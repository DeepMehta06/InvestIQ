import numpy as np
from backend.core.logger import get_logger

logger = get_logger(__name__)

def stub_optimize(
    tickers: list[str],
) -> dict[str, float]:
    """Return uniform dummy weights summing to 1.0.

    Phase 1 stub only — replace with real Markowitz in Phase 2.

    Args:
        tickers: List of asset ticker symbols.

    Returns:
        Dict mapping ticker → weight, uniformly distributed.
    """
    n = len(tickers)
    weight = round(1.0 / n, 6)
    weights = {ticker: weight for ticker in tickers}
    logger.info("Stub optimizer returning uniform weights for %d assets", n)
    return weights

def stub_metrics() -> dict:
    """Return placeholder risk metrics for Phase 1 skeleton.

    Returns:
        Dict with zeroed metric values matching the API contract shape.
    """
    return {
        "expected_return": 0.0,
        "volatility":      0.0,
        "sharpe_ratio":    0.0,
        "sortino_ratio":   0.0,
        "max_drawdown":    0.0,
        "var_95":          0.0,
        "cvar_95":         0.0,
        "var_95_parametric": 0.0,
    }

def stub_frontier(tickers: list[str]) -> list[dict]:
    """Return an empty frontier list for Phase 1.

    Returns:
        Empty list — real frontier generated in Phase 2.
    """
    return []
