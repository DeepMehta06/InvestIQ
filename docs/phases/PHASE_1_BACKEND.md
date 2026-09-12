# Portfolio Optimization Engine — Phase 1 Backend Briefing
## Everything Vedant must complete before Phase 2 begins

> **Owner:** Vedant (Backend — data, optimization, risk, ML)
> **Reviewed by:** Deep
> **Last updated:** Phase 1
>
> Read `docs/RULES.md` and `docs/ARCHITECTURE.md` before writing a single line. The API contract in ARCHITECTURE.md §8 is agreed — do not change response shapes without telling Deep first.

---

## Your Phase 1 goal in one sentence

By the end of Phase 1, Deep's frontend must be able to call `GET /api/v1/health` and receive a valid JSON response, and call `POST /api/v1/optimize` with a real asset list and date range and receive back a correctly shaped response — even if the optimization is a stub returning dummy weights.

The real Markowitz math, ML models, and Black-Litterman are Phase 2, 3, and 4. Phase 1 is the skeleton. The skeleton must be solid.

---

## Phase 1 checklist

Every box must be checked before Phase 2 begins.

### Documentation gate
- [ ] All functions have Google-style docstrings
- [ ] README backend setup section confirmed working on a clean environment
- [ ] `runs/phase_1_status.json` written by the phase runner

### Testing gate
- [ ] `pytest backend/tests/ -v` passes — zero failures
- [ ] Coverage ≥ 70% on new modules: `pytest --cov=backend --cov-report=term-missing`
- [ ] `/api/v1/health` tested manually with a browser or curl
- [ ] `/api/v1/optimize` tested manually with a curl POST

### Code quality gate
- [ ] `black backend/` — zero formatting changes
- [ ] `isort backend/` — zero import-order changes
- [ ] No `print()` anywhere — `logger.*` only
- [ ] No hardcoded values — all via `settings.*`
- [ ] No bare `except:` clauses

---

## Step 1 — Install dependencies

Create `requirements.txt` at the project root:

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
yfinance==0.2.40
pandas==2.2.2
numpy==1.26.4
scipy==1.13.0
cvxpy==1.5.1
scikit-learn==1.5.0
python-dotenv==1.0.1
pydantic-settings==2.2.1
pytest==8.2.0
pytest-cov==5.0.0
pytest-asyncio==0.23.7
httpx==0.27.0
black==24.4.2
isort==5.13.2
```

Install:
```bash
pip install -r requirements.txt
```

---

## Step 2 — Core config and logging

### `backend/core/config.py`

Single source of truth. Nothing is hardcoded anywhere else.

```python
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from .env and environment."""

    # Paths
    project_root: Path = Path(__file__).resolve().parents[2]
    cache_dir: Path = project_root / "data_cache"

    # API
    port: int = 8000
    version: str = "0.1.0"

    # Finance
    risk_free_rate: float = 0.05
    trading_days_per_year: int = 252
    min_history_days: int = 252      # minimum 1 year of data required
    frontier_points: int = 500       # number of points on the Efficient Frontier

    # ML (Phase 3 — defined here so config is complete)
    rf_n_estimators: int = 200
    rf_max_depth: int = 5
    ridge_alpha: float = 1.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
```

### `backend/core/logger.py`

```python
import logging
import sys


def get_logger(name: str) -> logging.Logger:
    """Create and return a configured logger.

    Args:
        name: Logger name — pass __name__ from the calling module.

    Returns:
        Configured Logger writing to stdout.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
            )
        )
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
```

Create `backend/core/__init__.py` — empty.

---

## Step 3 — Data fetcher

### `backend/data/fetcher.py`

```python
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

    logger.info("Fetching prices from yfinance: %s (%s to %s)", tickers, start_date, end_date)
    raw = yf.download(tickers, start=start_date, end=end_date, auto_adjust=True, progress=False)

    if isinstance(raw.columns, pd.MultiIndex):
        prices = raw["Close"]
    else:
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})

    prices = prices.dropna(how="all").ffill()

    for ticker in tickers:
        if ticker not in prices.columns or prices[ticker].dropna().shape[0] < settings.min_history_days:
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
```

Create `backend/data/__init__.py` — empty.

### Tests — `backend/tests/test_fetcher.py`

```python
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
```

---

## Step 4 — Stub optimization module

The real Markowitz solver is Phase 2. In Phase 1, implement a stub that returns valid-shaped dummy weights so the API contract is honoured and Deep's frontend can be tested end-to-end.

### `backend/optimization/stub.py`

```python
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
```

Create `backend/optimization/__init__.py` — empty.

---

## Step 5 — Request and response models

### `backend/api/models.py`

```python
from pydantic import BaseModel, field_validator
from typing import Optional


class BLView(BaseModel):
    """A single Black-Litterman investor view."""
    asset: str
    expected_return: float   # decimal, e.g. 0.25
    confidence: float        # decimal, 0.0 – 1.0

    @field_validator("confidence")
    @classmethod
    def confidence_in_range(cls, v: float) -> float:
        if not 0.0 < v <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        return v


class OptimizeRequest(BaseModel):
    """Request body for POST /api/v1/optimize."""
    assets: list[str]
    start_date: str          # YYYY-MM-DD
    end_date: str            # YYYY-MM-DD
    method: str              # "historical" | "ml" | "bl"
    objective: str           # "max_sharpe" | "min_variance" | "target_return"
    risk_free_rate: float = 0.05
    target_return: Optional[float] = None
    bl_views: Optional[list[BLView]] = None

    @field_validator("method")
    @classmethod
    def valid_method(cls, v: str) -> str:
        if v not in ("historical", "ml", "bl"):
            raise ValueError(f"method must be one of: historical, ml, bl. Got: {v}")
        return v

    @field_validator("objective")
    @classmethod
    def valid_objective(cls, v: str) -> str:
        if v not in ("max_sharpe", "min_variance", "target_return"):
            raise ValueError(f"objective must be one of: max_sharpe, min_variance, target_return. Got: {v}")
        return v

    @field_validator("assets")
    @classmethod
    def min_assets(cls, v: list[str]) -> list[str]:
        if len(v) < 2:
            raise ValueError("At least 2 assets are required for optimization.")
        return v
```

---

## Step 6 — FastAPI routes

### `backend/api/routes.py`

```python
from fastapi import APIRouter
from backend.api.models import OptimizeRequest
from backend.core.config import settings
from backend.core.logger import get_logger
from backend.data.fetcher import fetch_prices, compute_log_returns
from backend.optimization.stub import stub_optimize, stub_metrics, stub_frontier

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1")


@router.get("/health")
async def health() -> dict:
    """Health check endpoint.

    Returns:
        JSON with service status and version.
    """
    logger.info("Health check called")
    return {
        "success": True,
        "data": {
            "status": "ok",
            "version": settings.version,
        },
        "error": None,
    }


@router.post("/optimize")
async def optimize(request: OptimizeRequest) -> dict:
    """Run portfolio optimization and return weights, metrics, and frontier.

    Phase 1: Uses stub optimizer — returns uniform weights and zero metrics.
    Phase 2: Replaced with real Markowitz, ML, and BL implementations.

    Args:
        request: OptimizeRequest with assets, dates, method, and objective.

    Returns:
        JSON with weights, risk metrics, Efficient Frontier, and metadata.
    """
    logger.info(
        "Optimize called — assets: %s, method: %s, objective: %s",
        request.assets, request.method, request.objective
    )

    try:
        # Phase 1: fetch real prices to validate the asset/date range
        prices = fetch_prices(request.assets, request.start_date, request.end_date)
        returns = compute_log_returns(prices)
        logger.info("Data fetched — returns shape: %s", returns.shape)

        # Phase 1: stub weights and metrics (replaced in Phase 2)
        weights = stub_optimize(request.assets)
        metrics = stub_metrics()
        frontier = stub_frontier(request.assets)

        return {
            "success": True,
            "data": {
                "weights": weights,
                "metrics": metrics,
                "frontier": frontier,
                "method": request.method,
                "objective": request.objective,
                "assets": request.assets,
                "date_range": {
                    "start": request.start_date,
                    "end": request.end_date,
                },
            },
            "error": None,
        }

    except ValueError as e:
        logger.warning("Validation error in /optimize: %s", e)
        return {
            "success": False,
            "data": None,
            "error": str(e),
        }
    except Exception as e:
        logger.error("Unexpected error in /optimize: %s", e, exc_info=True)
        return {
            "success": False,
            "data": None,
            "error": "Internal server error. Check backend logs.",
        }
```

Create `backend/api/__init__.py` — empty.

---

## Step 7 — FastAPI entry point

### `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router
from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Portfolio Optimization Engine",
    version=settings.version,
    description="Markowitz, ML-enhanced, and Black-Litterman portfolio optimization API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup() -> None:
    logger.info("Portfolio Optimization Engine v%s starting", settings.version)
    settings.cache_dir.mkdir(exist_ok=True)
    logger.info("Data cache directory: %s", settings.cache_dir)
```

Run with:
```bash
uvicorn backend.main:app --reload --port 8000
```

---

## Step 8 — Tests

### `backend/tests/test_api.py`

```python
import pytest
from httpx import AsyncClient
from backend.main import app


@pytest.mark.asyncio
async def test_health_returns_ok():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
    assert "version" in body["data"]


@pytest.mark.asyncio
async def test_optimize_fewer_than_two_assets_returns_error():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/optimize",
            json={
                "assets": ["AAPL"],
                "start_date": "2022-01-01",
                "end_date": "2025-01-01",
                "method": "historical",
                "objective": "max_sharpe",
                "risk_free_rate": 0.05,
                "target_return": None,
                "bl_views": None,
            },
        )
    assert response.status_code == 422   # Pydantic validation error


@pytest.mark.asyncio
async def test_optimize_invalid_method_returns_422():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/optimize",
            json={
                "assets": ["AAPL", "MSFT"],
                "start_date": "2022-01-01",
                "end_date": "2025-01-01",
                "method": "invalid_method",
                "objective": "max_sharpe",
                "risk_free_rate": 0.05,
                "target_return": None,
                "bl_views": None,
            },
        )
    assert response.status_code == 422
```

### `backend/tests/test_stub.py`

```python
from backend.optimization.stub import stub_optimize, stub_metrics, stub_frontier


def test_stub_weights_sum_to_one():
    tickers = ["AAPL", "MSFT", "NVDA", "JPM"]
    weights = stub_optimize(tickers)
    assert abs(sum(weights.values()) - 1.0) < 1e-5


def test_stub_weights_keys_match_tickers():
    tickers = ["AAPL", "MSFT"]
    weights = stub_optimize(tickers)
    assert set(weights.keys()) == set(tickers)


def test_stub_metrics_has_required_keys():
    metrics = stub_metrics()
    required = {
        "expected_return", "volatility", "sharpe_ratio",
        "sortino_ratio", "max_drawdown", "var_95", "cvar_95", "var_95_parametric"
    }
    assert required.issubset(set(metrics.keys()))


def test_stub_frontier_is_list():
    assert isinstance(stub_frontier(["AAPL", "MSFT"]), list)
```

### `backend/tests/__init__.py` — empty

### `backend/tests/conftest.py`

```python
import pytest


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"
```

---

## Step 9 — Phase runner script (backend section)

Create `scripts/run_phase_1.py` — coordinate with Deep on this file since both of you have steps in it.

Your steps (add these to the shared script):

```python
run_step("pip_install",   "pip install -r requirements.txt", status)
run_step("black_check",   "black backend/ --check",          status)
run_step("isort_check",   "isort backend/ --check-only",     status)
run_step("pytest_backend","pytest backend/tests/ -v --cov=backend --cov-report=term-missing", status)
```

---

## Step 10 — README updates

Update the README (coordinate with Deep):

1. Confirm the backend setup commands work on a clean Python environment
2. Add the manual test curl commands so the frontend team can verify independently:

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Optimize (stub — returns uniform weights)
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "assets": ["AAPL","MSFT","NVDA","JPM","KO"],
    "start_date": "2022-01-01",
    "end_date": "2025-01-01",
    "method": "historical",
    "objective": "max_sharpe",
    "risk_free_rate": 0.05,
    "target_return": null,
    "bl_views": null
  }'
```

3. Update the phase status table to show Phase 1 in progress.

---

## What Phase 2 expects from you

At the end of Phase 1, Deep's frontend will:
- Call `/api/v1/health` on load and display backend status
- Call `/api/v1/optimize` with real assets and dates on Optimize button click
- Expect the exact response shape from ARCHITECTURE.md §8

In **Phase 2**, you will replace the stubs with:
- Real Markowitz mean-variance optimizer (`scipy.optimize` or `cvxpy`)
- Real covariance matrix with Ledoit-Wolf shrinkage
- Real expected returns from historical mean
- Real Efficient Frontier (500 points)
- Real risk metrics (Sharpe, Sortino, VaR, CVaR, Max Drawdown)

Do not implement any of Phase 2 in Phase 1. Keep the scope clean.

---

## File delivery checklist

| File | Status |
|---|---|
| `requirements.txt` | — |
| `backend/__init__.py` | — |
| `backend/core/config.py` | — |
| `backend/core/logger.py` | — |
| `backend/core/__init__.py` | — |
| `backend/data/fetcher.py` | — |
| `backend/data/__init__.py` | — |
| `backend/optimization/stub.py` | — |
| `backend/optimization/__init__.py` | — |
| `backend/api/models.py` | — |
| `backend/api/routes.py` | — |
| `backend/api/__init__.py` | — |
| `backend/main.py` | — |
| `backend/tests/test_fetcher.py` | — |
| `backend/tests/test_api.py` | — |
| `backend/tests/test_stub.py` | — |
| `backend/tests/__init__.py` | — |
| `backend/tests/conftest.py` | — |
| `runs/phase_1_status.json` (auto) | — |
| `README.md` (backend section updated) | — |
