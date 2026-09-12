# Portfolio Optimization Engine

> A production-grade portfolio optimization platform that compares three strategies — Historical Mean-Variance, ML-Enhanced, and Black-Litterman — using modern risk metrics, an efficient frontier explorer, and a real-time React dashboard. Designed for quantitative analysts and sophisticated investors who want to go beyond simple buy-and-hold.

---

## Architecture Overview

```mermaid
graph TD
    UI["React + Zustand Frontend\n(Vite, TypeScript, Tailwind)"]
    API["FastAPI Backend\n(/api/v1)"]
    OPT["Optimization Core\n(scipy, cvxpy)"]
    ML["ML Covariance Estimator\n(scikit-learn)"]
    BL["Black-Litterman Module"]
    DATA["Data Layer\n(yfinance + cache)"]

    UI -->|"POST /optimize\nGET /health"| API
    API --> OPT
    OPT --> ML
    OPT --> BL
    OPT --> DATA
```

---

## Prerequisites

- Python 3.10+
- Node.js ≥ 18
- pip

---

## Backend Setup

```bash
cd portfolio-optimizer/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Frontend Setup

```bash
cd portfolio-optimizer/frontend
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `RISK_FREE_RATE` | `0.05` | Annual risk-free rate used in Sharpe/Sortino |
| `CACHE_DIR` | `./data_cache` | Where yfinance data is cached |
| `PORT` | `8000` | FastAPI port |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Frontend API base URL |

---

## Phase Status

| Phase | Status | Owner |
|---|---|---|
| Phase 1 — Foundation | 🟡 In progress | Deep + Vedant |
| Phase 2 — Core Optimization | ⬜ Not started | Vedant |
| Phase 3 — ML Enhancement | ⬜ Not started | Vedant |
| Phase 4 — Black-Litterman | ⬜ Not started | Vedant |
| Phase 5 — Frontend Charts | ⬜ Not started | Deep |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Service health check |
| POST | `/api/v1/optimize` | Run portfolio optimization |

---

## Contributing

See `docs/RULES.md` before touching any file.
