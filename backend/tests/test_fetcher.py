import pandas as pd
import pytest
from unittest.mock import patch, MagicMock
from backend.data.fetcher import compute_log_returns


def test_log_returns_shape():
    """Log returns should have one fewer row than prices."""
    import numpy as np
    prices = pd.DataFrame(
        {"AAPL": [100.0, 102.0, 101.0, 105.0]},
        index=pd.date_range("2024-01-01", periods=4)
    )
    returns = compute_log_returns(prices)
    assert returns.shape == (3, 1)


def test_log_returns_values():
    """Log returns should match ln(P_t / P_{t-1})."""
    import numpy as np
    prices = pd.DataFrame(
        {"AAPL": [100.0, 110.0]},
        index=pd.date_range("2024-01-01", periods=2)
    )
    returns = compute_log_returns(prices)
    expected = np.log(110.0 / 100.0)
    assert abs(returns["AAPL"].iloc[0] - expected) < 1e-10