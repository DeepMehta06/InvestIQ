# Portfolio Optimization Engine — System Architecture

> Canonical reference for how the system is structured, how data flows, and why each technology was chosen.
> All diagrams use Mermaid syntax. ASCII art is not permitted per RULES.md §11.

---

## 1. System overview

A quantitative portfolio construction engine. The user selects assets, a date range, and an optimization strategy. The backend fetches historical market data, runs the selected optimization pipeline (Traditional Markowitz, ML-Enhanced, or Black-Litterman), and returns portfolio weights, risk metrics, and the full Efficient Frontier. The frontend renders everything interactively.

```mermaid
flowchart TD
    subgraph USER["User"]
        U["Analyst / Student"]
    end

    subgraph FE["Frontend — React + TypeScript"]
        CP["ConfigPanel\n(assets, dates, strategy, objective, BL views)"]
        MR["MetricsRow\n(Return, Volatility, Sharpe, Drawdown, VaR, CVaR)"]
        EF["EfficientFrontierChart\n(interactive scatter + hover tooltips)"]
        AC["AllocationChart\n(horizontal bar, weights by asset)"]
        CT["ComparisonTable\n(Historical vs ML vs BL)"]
    end

    subgraph API["Backend API — FastAPI (Python)"]
        OPT["POST /api/v1/optimize"]
        FRT["GET /api/v1/frontier"]
        HLTH["GET /api/v1/health"]
    end

    subgraph PIPE["Optimization Pipeline"]
        DATA["Data Layer\nyfinance → daily prices → log returns"]
        PRE["Preprocessing\nclean, align, compute covariance matrix"]
        TRAD["Traditional Pipeline\nmean returns → Markowitz → weights"]
        ML["ML Pipeline\nfeature engineering → Ridge + Random Forest → predicted returns → Markowitz"]
        BL["Black-Litterman Pipeline\nmarket equilibrium + user views → adjusted returns → Markowitz"]
        RISK["Risk Engine\nSharpe, Sortino, VaR, CVaR, Max Drawdown"]
        FRONT["Frontier Generator\n500-point Efficient Frontier"]
    end

    U -->|selects assets, strategy| CP
    CP -->|POST /optimize| OPT
    OPT --> DATA
    DATA --> PRE
    PRE --> TRAD
    PRE --> ML
    PRE --> BL
    TRAD --> RISK
    ML --> RISK
    BL --> RISK
    RISK --> FRONT
    FRONT -->|weights, metrics, frontier points| OPT
    OPT -->|JSON response| FE
    MR --> U
    EF --> U
    AC --> U
    CT --> U
```

---

## 2. Data pipeline

```mermaid
flowchart TD
    A["User input\nassets: AAPL, MSFT, NVDA ...\nstart_date, end_date"]
    B["yfinance\nfetch daily OHLCV data"]
    C["Raw price DataFrame\nshape: (trading_days × n_assets)"]
    D["Data cleaning\ndrop missing, forward-fill gaps, align dates"]
    E["Log returns\nln(P_t / P_{t-1})\nshape: (trading_days-1 × n_assets)"]
    F["Expected returns vector\nμ shape: (n_assets,)"]
    G["Covariance matrix\nΣ shape: (n_assets × n_assets)"]
    H["Ledoit-Wolf shrinkage\n(regularised Σ)"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    E --> G
    G --> H
    F --> |"to Traditional pipeline"| I1["Traditional Optimizer"]
    H --> |"to all pipelines"| I1
    F --> |"to ML pipeline"| I2["ML Optimizer"]
    H --> I2
    F --> |"to BL pipeline"| I3["BL Optimizer"]
    H --> I3
```

---

## 3. Traditional Markowitz pipeline

```mermaid
flowchart TD
    A["μ (n_assets,) — historical mean returns\nΣ (n_assets × n_assets) — covariance matrix"]

    subgraph OBJ["Objective selection"]
        O1["Minimum Variance\nmin wᵀΣw\ns.t. Σw=1, w≥0"]
        O2["Maximum Sharpe\nmax (wᵀμ - Rf) / sqrt(wᵀΣw)\ns.t. Σw=1, w≥0"]
        O3["Target Return\nmin wᵀΣw\ns.t. wᵀμ=target, Σw=1, w≥0"]
    end

    B["scipy.optimize / cvxpy\nquadratic program solver"]
    C["Optimal weights vector\nw* shape: (n_assets,)"]

    A --> OBJ
    OBJ --> B
    B --> C
```

---

## 4. ML-enhanced pipeline

```mermaid
flowchart TD
    A["Historical log returns\nshape: (trading_days × n_assets)"]

    subgraph FE_ENG["Feature Engineering (per asset)"]
        F1["Past 5-day return"]
        F2["Past 21-day return (1-month momentum)"]
        F3["Rolling 21-day volatility"]
        F4["20-day / 60-day moving average ratio"]
        F5["Past 63-day return (3-month momentum)"]
    end

    subgraph ENS["ML Ensemble"]
        R["Ridge Regression\nalpha tuned via cross-validation"]
        RF["Random Forest Regressor\nn_estimators=200, max_depth=5"]
        AVG["Ensemble average\nμ_ML = 0.5 × Ridge + 0.5 × RF"]
    end

    C["Predicted returns vector\nμ_ML shape: (n_assets,)"]
    D["Markowitz optimizer\n(same as Traditional, μ replaced by μ_ML)"]
    E["ML-enhanced weights\nw_ML shape: (n_assets,)"]

    A --> FE_ENG
    FE_ENG --> ENS
    ENS --> C
    C --> D
    D --> E
```

---

## 5. Black-Litterman pipeline

```mermaid
flowchart TD
    A["Market equilibrium returns\nΠ = δ × Σ × w_market\n(implied by market-cap weights)"]
    B["User views matrix P\n(k × n_assets) — which assets each view is about"]
    C["View returns vector Q\n(k,) — expected return per view"]
    D["View confidence matrix Ω\n(k × k) diagonal — uncertainty per view"]

    subgraph BL["Black-Litterman formula"]
        E["Posterior expected returns\nμ_BL = [(τΣ)⁻¹ + PᵀΩ⁻¹P]⁻¹ × [(τΣ)⁻¹Π + PᵀΩ⁻¹Q]"]
    end

    F["Markowitz optimizer\n(μ replaced by μ_BL)"]
    G["BL-adjusted weights\nw_BL shape: (n_assets,)"]

    A --> BL
    B --> BL
    C --> BL
    D --> BL
    BL --> F
    F --> G
```

---

## 6. Risk engine

```mermaid
flowchart TD
    A["Portfolio weights w*\nExpected returns μ\nCovariance matrix Σ\nHistorical return series"]

    subgraph METRICS["Risk metrics computed"]
        M1["Expected Return\nRp = wᵀμ (annualised × 252)"]
        M2["Volatility\nσp = sqrt(wᵀΣw) (annualised × sqrt(252))"]
        M3["Sharpe Ratio\n(Rp - Rf) / σp\nRf = 0.05 (configurable)"]
        M4["Sortino Ratio\n(Rp - Rf) / σ_downside"]
        M5["Maximum Drawdown\nmax peak-to-trough decline\non cumulative return series"]
        M6["Historical VaR (95%)\n5th percentile of daily return distribution"]
        M7["CVaR (95%)\nmean of returns below VaR threshold"]
        M8["Parametric VaR (95%)\nμp - 1.645 × σp (daily)"]
    end

    A --> METRICS
    METRICS --> OUT["Risk report dict\nall metrics + weights"]
```

---

## 7. Efficient Frontier generator

```mermaid
flowchart TD
    A["Target return range\nlinspace(min_return, max_return, 500)"]
    B["For each target return:\nsolve min-variance portfolio\n→ (volatility, return, weights)"]
    C["Frontier point list\n500 × (volatility, return, weights_dict)"]
    D["Special portfolios identified:\n★ Max Sharpe\n● Min Variance"]

    A --> B
    B --> C
    C --> D
    D --> OUT["Frontier payload\nincluded in API response"]
```

---

## 8. API contract

This is the agreed interface between Vedant's backend and Deep's frontend. Neither side changes this without telling the other.

### `POST /api/v1/optimize`

**Request:**
```json
{
  "assets": ["AAPL", "MSFT", "NVDA", "JPM", "XOM", "KO"],
  "start_date": "2022-01-01",
  "end_date": "2026-01-01",
  "method": "historical",
  "objective": "max_sharpe",
  "risk_free_rate": 0.05,
  "target_return": null,
  "bl_views": null
}
```

`method` options: `"historical"` | `"ml"` | `"bl"`
`objective` options: `"max_sharpe"` | `"min_variance"` | `"target_return"`

For Black-Litterman, `bl_views` shape:
```json
{
  "bl_views": [
    { "asset": "NVDA", "expected_return": 0.25, "confidence": 0.70 },
    { "asset": "KO",   "expected_return": 0.06, "confidence": 0.90 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weights": {
      "AAPL": 0.22,
      "MSFT": 0.28,
      "NVDA": 0.12,
      "JPM":  0.16,
      "XOM":  0.10,
      "KO":   0.12
    },
    "metrics": {
      "expected_return": 0.147,
      "volatility":      0.112,
      "sharpe_ratio":    1.21,
      "sortino_ratio":   1.45,
      "max_drawdown":   -0.134,
      "var_95":         -0.028,
      "cvar_95":        -0.041,
      "var_95_parametric": -0.026
    },
    "frontier": [
      {
        "volatility": 0.089,
        "expected_return": 0.092,
        "sharpe": 0.47,
        "weights": { "AAPL": 0.10, "MSFT": 0.35, ... }
      }
    ],
    "method": "historical",
    "objective": "max_sharpe",
    "assets": ["AAPL", "MSFT", "NVDA", "JPM", "XOM", "KO"],
    "date_range": { "start": "2022-01-01", "end": "2026-01-01" }
  },
  "error": null
}
```

### `GET /api/v1/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "0.1.0"
  },
  "error": null
}
```

### Error response shape (all endpoints)

```json
{
  "success": false,
  "data": null,
  "error": "Insufficient data: NVDA has fewer than 252 trading days in the selected range."
}
```

---

## 9. Repository structure

```
portfolio-optimizer/
├── backend/
│   ├── api/
│   │   └── routes.py              # FastAPI route handlers
│   ├── core/
│   │   ├── config.py              # Settings, constants, env vars
│   │   └── logger.py              # Logging setup
│   ├── data/
│   │   └── fetcher.py             # yfinance wrapper, caching
│   ├── optimization/
│   │   ├── markowitz.py           # Traditional optimizer
│   │   ├── ml_optimizer.py        # ML return forecasting + optimizer
│   │   ├── black_litterman.py     # BL model
│   │   └── frontier.py            # Efficient Frontier generator
│   ├── risk/
│   │   └── metrics.py             # All risk metric calculations
│   ├── tests/
│   │   ├── test_markowitz.py
│   │   ├── test_ml_optimizer.py
│   │   ├── test_black_litterman.py
│   │   ├── test_risk_metrics.py
│   │   └── test_api.py
│   └── main.py                    # FastAPI entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigPanel/
│   │   │   ├── MetricsRow/
│   │   │   ├── EfficientFrontierChart/
│   │   │   ├── AllocationChart/
│   │   │   └── ComparisonTable/
│   │   ├── hooks/
│   │   │   └── useOptimize.ts     # Optimization API call + state
│   │   ├── store/
│   │   │   └── usePortfolioStore.ts
│   │   ├── services/
│   │   │   └── apiService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   └── package.json
├── docs/
│   ├── RULES.md
│   ├── ARCHITECTURE.md            # This file
│   ├── DESIGN.md
│   └── phases/
│       ├── PHASE_1.md
│       ├── PHASE_1_BACKEND.md
│       └── ...
├── scripts/
│   ├── run_phase_1.py
│   └── run_all_phases.py
├── runs/                          # Phase status files — gitignored
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 10. Technology decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend framework | FastAPI | Async, automatic OpenAPI docs, clean request/response typing |
| Data source | yfinance | Free, reliable, covers all required global equities |
| Optimization solver | scipy.optimize + cvxpy | scipy for speed on standard problems, cvxpy for constrained QP |
| Covariance estimation | Ledoit-Wolf shrinkage | More stable than sample covariance with < 5 years of data |
| ML models | Ridge Regression + Random Forest | Interpretable, low overfitting risk, fast to retrain |
| Frontend framework | React 18 | Component model suits the multi-panel dashboard |
| Charting library | Recharts | React-native, composable, hover interactions built-in |
| Frontend state | Zustand | Lightweight, no boilerplate, sufficient for this scale |
| Styling | Tailwind CSS | Enforces the design token system, no CSS file sprawl |
| Language (frontend) | TypeScript (strict) | Catches API contract mismatches at compile time |
