# Portfolio Optimization Engine — Phase 1 (Deep's Work)
## Project Initialization, Documentation & Frontend Foundation

> **Owner:** Deep (Frontend + Project Infrastructure)
> **Phase goal:** Repository exists, all docs are committed, the frontend skeleton runs, TypeScript compiles clean, and the frontend can hit the backend's health endpoint. No optimization logic yet.
> **Dependency:** API contract (ARCHITECTURE.md §8) must be reviewed and agreed with Vedant before Phase 1D.

---

## Phase 1 checklist

Every box must be checked before Phase 2 begins.

### Documentation gate
- [ ] `docs/RULES.md` committed
- [ ] `docs/ARCHITECTURE.md` committed (Mermaid diagrams only — no ASCII art)
- [ ] `docs/DESIGN.md` committed
- [ ] `docs/phases/PHASE_1.md` (this file) committed
- [ ] `docs/phases/PHASE_1_BACKEND.md` (Vedant's briefing) committed
- [ ] `README.md` complete with setup for both backend and frontend
- [ ] All React components have JSDoc comments on their props interface

### Testing gate
- [ ] `npm run dev` — renders without errors
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint` — zero ESLint errors
- [ ] `GET /api/v1/health` called from the frontend and response shown in the status indicator
- [ ] ConfigPanel renders all input fields correctly with no console errors

### Review gate
- [ ] No `any` type anywhere in TypeScript
- [ ] No inline styles — Tailwind classes only
- [ ] No hardcoded API URLs — all via `import.meta.env`
- [ ] All components export exactly one default export
- [ ] All numeric values use `font-mono` class

---

## Phase 1A — Repository scaffold

### 1. Create the repository

```bash
mkdir portfolio-optimizer
cd portfolio-optimizer
git init
git checkout -b main
```

### 2. Create directory tree

Create every folder from ARCHITECTURE.md §9. Add a `.gitkeep` in each empty directory.

```bash
mkdir -p backend/api backend/core backend/data backend/optimization backend/risk backend/tests
mkdir -p frontend/src/components frontend/src/hooks frontend/src/store frontend/src/services frontend/src/types frontend/src/styles
mkdir -p docs/phases scripts runs notebooks
```

### 3. Root-level files

**`.gitignore`**
```
# Python
__pycache__/
*.pyc
*.pyo
.env
venv/
.venv/
*.egg-info/
dist/
.pytest_cache/
.coverage
htmlcov/

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# Data / cache
*.csv
*.parquet
data_cache/
runs/
*.log

# OS
.DS_Store
Thumbs.db
```

**`.env.example`**
```
# Backend
RISK_FREE_RATE=0.05
CACHE_DIR=./data_cache
PORT=8000

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Phase 1B — README

Write `README.md` at the root. Sections required:

### 1. Project overview
One paragraph: what the engine does, what strategies it supports, who it is for.

### 2. Architecture overview
Embed one Mermaid diagram (condensed version of ARCHITECTURE.md §1).

### 3. Prerequisites
- Python 3.10+
- Node.js ≥ 18
- pip

### 4. Backend setup
```bash
cd portfolio-optimizer/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Frontend setup
```bash
cd portfolio-optimizer/frontend
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev
```

### 6. Environment variables
| Variable | Default | Description |
|---|---|---|
| `RISK_FREE_RATE` | `0.05` | Annual risk-free rate used in Sharpe/Sortino |
| `CACHE_DIR` | `./data_cache` | Where yfinance data is cached |
| `PORT` | `8000` | FastAPI port |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Frontend API base URL |

### 7. Phase status table
| Phase | Status | Owner |
|---|---|---|
| Phase 1 — Foundation | 🟡 In progress | Deep + Vedant |
| Phase 2 — Core Optimization | ⬜ Not started | Vedant |
| Phase 3 — ML Enhancement | ⬜ Not started | Vedant |
| Phase 4 — Black-Litterman | ⬜ Not started | Vedant |
| Phase 5 — Frontend Charts | ⬜ Not started | Deep |

### 8. API endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Service health check |
| POST | `/api/v1/optimize` | Run portfolio optimization |

### 9. Contributing
See `docs/RULES.md` before touching any file.

---

## Phase 1C — Frontend initialization

### Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5.x strict | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Zustand | 4.x | Global state |
| Recharts | 2.x | Charts (install now, use in Phase 5) |
| ESLint + Prettier | latest | Code quality |

### Scaffold

```bash
cd portfolio-optimizer
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Install dependencies

```bash
npm install zustand recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks
npm install -D prettier eslint-config-prettier
```

### TypeScript config

In `tsconfig.json`, ensure strict mode:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### Tailwind config

`tailwind.config.js`:
```js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:               '#0A0E1A',
        surface:          '#111827',
        'surface-raised': '#1A2235',
        border:           '#1E2D45',
        primary:          '#E2E8F0',
        secondary:        '#7B90B2',
        muted:            '#3D5070',
        accent:           '#3B82F6',
        'accent-dim':     '#0F2044',
        positive:         '#10B981',
        'positive-dim':   '#052E1C',
        negative:         '#EF4444',
        'negative-dim':   '#2C0A0A',
        warning:          '#F59E0B',
        frontier:         '#6366F1',
        'portfolio-ml':   '#8B5CF6',
        'portfolio-trad': '#3B82F6',
        'portfolio-bl':   '#06B6D4',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### `src/styles/global.css`

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    height: 100%;
  }
  body {
    background-color: #0A0E1A;
    color: #E2E8F0;
    font-family: 'IBM Plex Sans', sans-serif;
  }
}
```

---

## Phase 1D — TypeScript interfaces

Create `src/types/index.ts`. This is the API contract made into types. Do not change these without telling Vedant.

```typescript
// ─── Request types ─────────────────────────────────────────────

export type OptimizationMethod = 'historical' | 'ml' | 'bl';
export type OptimizationObjective = 'max_sharpe' | 'min_variance' | 'target_return';

export interface BLView {
  asset: string;
  expected_return: number;   // decimal, e.g. 0.25 = 25%
  confidence: number;        // decimal, e.g. 0.70 = 70%
}

export interface OptimizeRequest {
  assets: string[];
  start_date: string;        // YYYY-MM-DD
  end_date: string;          // YYYY-MM-DD
  method: OptimizationMethod;
  objective: OptimizationObjective;
  risk_free_rate: number;    // decimal, default 0.05
  target_return: number | null;
  bl_views: BLView[] | null;
}

// ─── Response types ────────────────────────────────────────────

export interface PortfolioWeights {
  [ticker: string]: number;  // e.g. { AAPL: 0.22, MSFT: 0.28 }
}

export interface RiskMetrics {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  var_95: number;
  cvar_95: number;
  var_95_parametric: number;
}

export interface FrontierPoint {
  volatility: number;
  expected_return: number;
  sharpe: number;
  weights: PortfolioWeights;
}

export interface OptimizeResponseData {
  weights: PortfolioWeights;
  metrics: RiskMetrics;
  frontier: FrontierPoint[];
  method: OptimizationMethod;
  objective: OptimizationObjective;
  assets: string[];
  date_range: { start: string; end: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export type OptimizeResponse = ApiResponse<OptimizeResponseData>;

export interface HealthData {
  status: string;
  version: string;
}

export type HealthResponse = ApiResponse<HealthData>;

// ─── Frontend state types ──────────────────────────────────────

export interface PortfolioResult {
  method: OptimizationMethod;
  weights: PortfolioWeights;
  metrics: RiskMetrics;
  frontier: FrontierPoint[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ─── Asset universe ────────────────────────────────────────────

export interface Asset {
  ticker: string;
  name: string;
  sector: 'Technology' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy';
}

export const ASSET_UNIVERSE: Asset[] = [
  { ticker: 'AAPL',  name: 'Apple',           sector: 'Technology' },
  { ticker: 'MSFT',  name: 'Microsoft',        sector: 'Technology' },
  { ticker: 'NVDA',  name: 'NVIDIA',           sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet',         sector: 'Technology' },
  { ticker: 'META',  name: 'Meta',             sector: 'Technology' },
  { ticker: 'JPM',   name: 'JPMorgan Chase',   sector: 'Finance'    },
  { ticker: 'GS',    name: 'Goldman Sachs',    sector: 'Finance'    },
  { ticker: 'BAC',   name: 'Bank of America',  sector: 'Finance'    },
  { ticker: 'JNJ',   name: 'Johnson & Johnson',sector: 'Healthcare' },
  { ticker: 'PFE',   name: 'Pfizer',           sector: 'Healthcare' },
  { ticker: 'UNH',   name: 'UnitedHealth',     sector: 'Healthcare' },
  { ticker: 'KO',    name: 'Coca-Cola',        sector: 'Consumer'   },
  { ticker: 'PG',    name: 'Procter & Gamble', sector: 'Consumer'   },
  { ticker: 'XOM',   name: 'ExxonMobil',       sector: 'Energy'     },
  { ticker: 'CVX',   name: 'Chevron',          sector: 'Energy'     },
];

export const SECTOR_COLORS: Record<Asset['sector'], string> = {
  Technology: '#6366F1',
  Finance:    '#3B82F6',
  Healthcare: '#10B981',
  Consumer:   '#F59E0B',
  Energy:     '#EF4444',
};
```

---

## Phase 1E — Zustand store

Create `src/store/usePortfolioStore.ts`:

```typescript
import { create } from 'zustand';
import type {
  OptimizationMethod,
  OptimizationObjective,
  BLView,
  PortfolioResult,
  LoadingState,
} from '../types';

interface PortfolioState {
  // Config
  selectedAssets: string[];
  startDate: string;
  endDate: string;
  method: OptimizationMethod;
  objective: OptimizationObjective;
  targetReturn: number | null;
  blViews: BLView[];

  // Config setters
  toggleAsset: (ticker: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setMethod: (method: OptimizationMethod) => void;
  setObjective: (objective: OptimizationObjective) => void;
  setTargetReturn: (value: number | null) => void;
  setBLViews: (views: BLView[]) => void;

  // Results — one result slot per method
  results: Partial<Record<OptimizationMethod, PortfolioResult>>;
  activeResult: PortfolioResult | null;
  setResult: (method: OptimizationMethod, result: PortfolioResult) => void;
  setActiveResult: (result: PortfolioResult | null) => void;

  // Loading / error
  loadingState: LoadingState;
  errorMessage: string | null;
  setLoadingState: (state: LoadingState) => void;
  setErrorMessage: (msg: string | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  selectedAssets: ['AAPL', 'MSFT', 'NVDA', 'JPM', 'KO'],
  startDate: '2021-01-01',
  endDate: '2025-01-01',
  method: 'historical',
  objective: 'max_sharpe',
  targetReturn: null,
  blViews: [],

  toggleAsset: (ticker) =>
    set((state) => ({
      selectedAssets: state.selectedAssets.includes(ticker)
        ? state.selectedAssets.filter((t) => t !== ticker)
        : [...state.selectedAssets, ticker],
    })),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setMethod: (method) => set({ method }),
  setObjective: (objective) => set({ objective }),
  setTargetReturn: (targetReturn) => set({ targetReturn }),
  setBLViews: (blViews) => set({ blViews }),

  results: {},
  activeResult: null,
  setResult: (method, result) =>
    set((state) => ({
      results: { ...state.results, [method]: result },
      activeResult: result,
    })),
  setActiveResult: (activeResult) => set({ activeResult }),

  loadingState: 'idle',
  errorMessage: null,
  setLoadingState: (loadingState) => set({ loadingState }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
}));
```

---

## Phase 1F — Services layer

Create `src/services/apiService.ts`:

```typescript
import type { OptimizeRequest, OptimizeResponse, HealthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  health: (): Promise<HealthResponse> =>
    request<HealthResponse>('/health'),

  optimize: (payload: OptimizeRequest): Promise<OptimizeResponse> =>
    request<OptimizeResponse>('/optimize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
```

---

## Phase 1G — Custom hook

Create `src/hooks/useOptimize.ts`:

```typescript
import { usePortfolioStore } from '../store/usePortfolioStore';
import { apiService } from '../services/apiService';
import type { OptimizeRequest } from '../types';

export function useOptimize() {
  const {
    selectedAssets,
    startDate,
    endDate,
    method,
    objective,
    targetReturn,
    blViews,
    setResult,
    setActiveResult,
    setLoadingState,
    setErrorMessage,
  } = usePortfolioStore();

  const runOptimization = async () => {
    if (selectedAssets.length < 2) return;

    setLoadingState('loading');
    setErrorMessage(null);

    const payload: OptimizeRequest = {
      assets: selectedAssets,
      start_date: startDate,
      end_date: endDate,
      method,
      objective,
      risk_free_rate: 0.05,
      target_return: objective === 'target_return' ? targetReturn : null,
      bl_views: method === 'bl' ? blViews : null,
    };

    try {
      const response = await apiService.optimize(payload);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Unknown error from backend');
      }

      const result = {
        method,
        weights: response.data.weights,
        metrics: response.data.metrics,
        frontier: response.data.frontier,
      };

      setResult(method, result);
      setActiveResult(result);
      setLoadingState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setErrorMessage(message);
      setLoadingState('error');
    }
  };

  return { runOptimization };
}
```

---

## Phase 1H — UI components (Phase 1 scope)

Build every component in skeleton form — correct structure, correct Tailwind classes, correct props, real store connections. Charts are stubbed with a placeholder div in Phase 1; real chart rendering is Phase 5.

### Components to build in Phase 1

| Component | File | Phase 1 scope |
|---|---|---|
| `AppShell` | `src/components/AppShell/AppShell.tsx` | Two-column layout shell |
| `TopBar` | `src/components/TopBar/TopBar.tsx` | Title + backend health indicator |
| `ConfigPanel` | `src/components/ConfigPanel/ConfigPanel.tsx` | All input controls + Optimize button |
| `AssetSelector` | `src/components/ConfigPanel/AssetSelector.tsx` | Chip grid grouped by sector |
| `StrategyToggle` | `src/components/ConfigPanel/StrategyToggle.tsx` | Historical / ML / BL segmented control |
| `ObjectiveSelector` | `src/components/ConfigPanel/ObjectiveSelector.tsx` | Radio group for optimization objective |
| `BLViewsTable` | `src/components/ConfigPanel/BLViewsTable.tsx` | Add/remove BL views table |
| `MetricsRow` | `src/components/MetricsRow/MetricsRow.tsx` | Six metric cards (or skeleton) |
| `MetricCard` | `src/components/MetricsRow/MetricCard.tsx` | Single metric card |
| `ResultsArea` | `src/components/ResultsArea/ResultsArea.tsx` | Empty state / loading / charts placeholder |

Do not build `EfficientFrontierChart`, `AllocationChart`, or `ComparisonTable` in Phase 1. Those are Phase 5 and require Vedant's real data.

### `AppShell.tsx`

```tsx
import TopBar from '../TopBar/TopBar';
import ConfigPanel from '../ConfigPanel/ConfigPanel';
import ResultsArea from '../ResultsArea/ResultsArea';

/**
 * Root layout shell. Two-column layout: fixed config panel left, results right.
 */
export default function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-bg text-primary font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-border overflow-y-auto">
          <ConfigPanel />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <ResultsArea />
        </main>
      </div>
    </div>
  );
}
```

### `TopBar.tsx`

Fetches `/health` on mount, shows a green dot if backend is up, red if not.

```tsx
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

export default function TopBar() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    apiService.health()
      .then((r) => setHealthy(r.success))
      .catch(() => setHealthy(false));
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface flex-shrink-0">
      <span className="text-heading font-semibold tracking-tight">
        Portfolio Optimization Engine
      </span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            healthy === true ? 'bg-positive' :
            healthy === false ? 'bg-negative' :
            'bg-muted'
          }`}
        />
        <span className="text-small text-secondary font-mono">
          {healthy === true ? 'Backend connected' :
           healthy === false ? 'Backend offline' :
           'Checking…'}
        </span>
      </div>
    </header>
  );
}
```

### `MetricCard.tsx`

```tsx
interface MetricCardProps {
  /** Display label, e.g. "Expected Return" */
  label: string;
  /** Formatted value string, e.g. "+14.7%" */
  value: string;
  /** Tailwind text color class for the value */
  valueColor?: string;
}

/**
 * Single metric display card used in MetricsRow.
 */
export default function MetricCard({ label, value, valueColor = 'text-primary' }: MetricCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-1">
      <span className="text-small text-secondary">{label}</span>
      <span className={`text-value font-mono font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}
```

### `MetricsRow.tsx`

```tsx
import MetricCard from './MetricCard';
import { usePortfolioStore } from '../../store/usePortfolioStore';

function formatPct(value: number, signed = false): string {
  const pct = (value * 100).toFixed(1);
  return signed && value > 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Horizontal row of six risk metric cards. Shows skeleton state while loading.
 */
export default function MetricsRow() {
  const { activeResult, loadingState } = usePortfolioStore();

  if (loadingState === 'loading') {
    return (
      <div className="grid grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!activeResult) return null;

  const m = activeResult.metrics;

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      <MetricCard label="Expected Return" value={formatPct(m.expected_return, true)} valueColor="text-positive" />
      <MetricCard label="Volatility"      value={formatPct(m.volatility)} />
      <MetricCard label="Sharpe Ratio"    value={m.sharpe_ratio.toFixed(2)} valueColor="text-positive" />
      <MetricCard label="Max Drawdown"    value={formatPct(m.max_drawdown)} valueColor="text-negative" />
      <MetricCard label="VaR (95%)"       value={formatPct(m.var_95)} valueColor="text-negative" />
      <MetricCard label="CVaR (95%)"      value={formatPct(m.cvar_95)} valueColor="text-warning" />
    </div>
  );
}
```

### `ResultsArea.tsx`

```tsx
import MetricsRow from '../MetricsRow/MetricsRow';
import { usePortfolioStore } from '../../store/usePortfolioStore';

/**
 * Main results area. Shows idle, loading, error, or results state.
 */
export default function ResultsArea() {
  const { loadingState, errorMessage, activeResult } = usePortfolioStore();

  if (loadingState === 'idle' && !activeResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3">
        <span className="text-4xl">📈</span>
        <p className="text-heading text-secondary">Configure your portfolio and click Optimize</p>
        <p className="text-body text-muted">Select assets, choose a strategy, and run the engine.</p>
      </div>
    );
  }

  if (loadingState === 'error' && errorMessage) {
    return (
      <div className="bg-negative-dim border border-negative rounded-lg p-4 text-negative text-body">
        {errorMessage}
      </div>
    );
  }

  return (
    <div>
      <MetricsRow />
      {/* Phase 5: EfficientFrontierChart, AllocationChart, ComparisonTable */}
      <div className="bg-surface border border-border rounded-lg p-8 flex items-center justify-center text-secondary text-body">
        Charts will render here in Phase 5
      </div>
    </div>
  );
}
```

---

## Phase 1I — Phase runner script

Create `scripts/run_phase_1.py`:

```python
"""Phase 1 validation runner — frontend side.

Usage:
    python scripts/run_phase_1.py
    python scripts/run_phase_1.py --reset
"""

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

STATUS_FILE = Path("runs/phase_1_status.json")


def load_status() -> dict:
    if STATUS_FILE.exists():
        return json.loads(STATUS_FILE.read_text())
    return {
        "started_at": datetime.utcnow().isoformat(),
        "last_updated": None,
        "steps_completed": [],
        "step_details": {},
    }


def save_status(status: dict) -> None:
    STATUS_FILE.parent.mkdir(exist_ok=True)
    status["last_updated"] = datetime.utcnow().isoformat()
    STATUS_FILE.write_text(json.dumps(status, indent=2))


def run_step(name: str, cmd: str, status: dict, cwd: str = ".") -> None:
    if name in status["steps_completed"]:
        print(f"[SKIP] {name} — already completed")
        return
    print(f"[RUN]  {name}: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"[FAIL] {name}")
        sys.exit(result.returncode)
    status["steps_completed"].append(name)
    status["step_details"][name] = {"completed_at": datetime.utcnow().isoformat()}
    save_status(status)
    print(f"[PASS] {name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    if args.reset and STATUS_FILE.exists():
        STATUS_FILE.unlink()
        print("[RESET] Phase 1 status cleared")

    status = load_status()

    run_step("npm_install",  "npm install",            status, cwd="frontend")
    run_step("type_check",   "npm run type-check",     status, cwd="frontend")
    run_step("lint",         "npm run lint",            status, cwd="frontend")
    run_step("build",        "npm run build",           status, cwd="frontend")

    print("\n✅ Phase 1 frontend validation complete.")


if __name__ == "__main__":
    main()
```

---

## Phase 1 deliverables summary

| Deliverable | Path |
|---|---|
| Repository initialized | `/` |
| `.gitignore` | `/.gitignore` |
| `.env.example` | `/.env.example` |
| `README.md` | `/README.md` |
| `RULES.md` | `/docs/RULES.md` |
| `ARCHITECTURE.md` | `/docs/ARCHITECTURE.md` |
| `DESIGN.md` | `/docs/DESIGN.md` |
| `PHASE_1.md` (this file) | `/docs/phases/PHASE_1.md` |
| `PHASE_1_BACKEND.md` | `/docs/phases/PHASE_1_BACKEND.md` |
| Frontend scaffold | `/frontend/` |
| Tailwind design tokens | `/frontend/tailwind.config.js` |
| TypeScript interfaces | `/frontend/src/types/index.ts` |
| Zustand store | `/frontend/src/store/usePortfolioStore.ts` |
| API service | `/frontend/src/services/apiService.ts` |
| `useOptimize` hook | `/frontend/src/hooks/useOptimize.ts` |
| `AppShell` component | `/frontend/src/components/AppShell/` |
| `TopBar` component | `/frontend/src/components/TopBar/` |
| `ConfigPanel` + sub-components | `/frontend/src/components/ConfigPanel/` |
| `MetricsRow` + `MetricCard` | `/frontend/src/components/MetricsRow/` |
| `ResultsArea` | `/frontend/src/components/ResultsArea/` |
| Phase runner | `/scripts/run_phase_1.py` |
| Phase status (auto-generated) | `/runs/phase_1_status.json` |

---

## What Phase 2 unlocks

Once both Phase 1 checklists are done (this doc + PHASE_1_BACKEND.md):
- The frontend can call `/api/v1/health` and confirm the backend is alive
- The full TypeScript contract is in place — any API shape mismatch will be a compile error
- The Zustand store models the complete application state
- Vedant can now work on Phase 2 (real optimization) without touching any frontend code
- The `useOptimize` hook is wired — when Vedant's `/optimize` endpoint is ready, the frontend will work with zero changes
