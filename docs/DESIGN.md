# Portfolio Optimization Engine — Design Specification

> Visual identity, UX principles, and component-level design rules for the frontend.
> Every frontend contributor must read this before writing a single component.

---

## 1. What this product is

A quantitative portfolio construction tool. The user selects assets, picks a strategy (Historical Markowitz, ML-Enhanced, or Black-Litterman), and the engine returns an optimized portfolio with full risk analytics and an interactive Efficient Frontier.

The design must communicate:
- **Precision** — this is a quantitative tool, not a retail app. Numbers are the product.
- **Analytical depth** — users need to explore and compare, not just read a result
- **Trustworthiness** — if the UI looks casual, the numbers feel untrustworthy

Primary user: a finance/ML student or analyst running portfolio experiments. They are comfortable reading tables, ratios, and scatter plots.

---

## 2. Visual identity

### 2.1 Color palette

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#0A0E1A` | Page background |
| `--color-surface` | `#111827` | Card / panel background |
| `--color-surface-raised` | `#1A2235` | Elevated panels, dropdowns |
| `--color-border` | `#1E2D45` | Dividers, card borders |
| `--color-text-primary` | `#E2E8F0` | Body text, values, headings |
| `--color-text-secondary` | `#7B90B2` | Labels, captions, axis text |
| `--color-text-muted` | `#3D5070` | Disabled states, ghost text |
| `--color-accent` | `#3B82F6` | Primary CTA, active selection, links |
| `--color-accent-dim` | `#0F2044` | Accent background tint |
| `--color-positive` | `#10B981` | Positive returns, Sharpe highlight |
| `--color-positive-dim` | `#052E1C` | Positive background tint |
| `--color-negative` | `#EF4444` | Drawdown, VaR, losses |
| `--color-negative-dim` | `#2C0A0A` | Negative background tint |
| `--color-warning` | `#F59E0B` | CVaR, caution metrics |
| `--color-frontier` | `#6366F1` | Efficient Frontier curve color |
| `--color-ml` | `#8B5CF6` | ML-enhanced portfolio marker |
| `--color-traditional` | `#3B82F6` | Traditional portfolio marker |
| `--color-bl` | `#06B6D4` | Black-Litterman portfolio marker |

**Rationale:** Deep navy-black base for a data-dense analytical tool. Three distinct portfolio colors (blue, purple, cyan) that remain distinguishable in both colored and grayscale contexts — important for printed reports. Green/red for return/risk semantics follows universal financial convention so users don't have to re-learn.

### 2.2 Typography

**Primary face:** `IBM Plex Sans` — designed for data interfaces, excellent at small sizes, professional without being corporate-bland.
**Numeric / monospace face:** `IBM Plex Mono` — same family, used for all financial figures, percentages, ratios, and metric values so they align vertically in tables.

Both from Google Fonts. One family across the whole product.

| Scale token | Size | Weight | Use |
|---|---|---|---|
| `--text-display` | 1.75rem / 28px | 600 | Page title only |
| `--text-heading` | 1.125rem / 18px | 600 | Section headings |
| `--text-subheading` | 0.9375rem / 15px | 500 | Card titles, panel headers |
| `--text-body` | 0.875rem / 14px | 400 | General body copy, labels |
| `--text-small` | 0.75rem / 12px | 400 | Captions, axis tick labels |
| `--text-micro` | 0.6875rem / 11px | 500 | Badges, status pills |
| `--text-value` | 1.25rem / 20px | 600 | Big metric values (Sharpe, Return %) |
| `--text-mono` | 0.875rem / 14px | 400 | All numeric values in tables/cards |

### 2.3 Spacing system

Base unit: `4px`.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |

### 2.4 Shape and depth

Border radius: `8px` for panels/cards, `6px` for inputs/buttons, `4px` for badges and pills. No pill-shaped buttons — this is an analytical tool.

Subtle border on every card:
```css
border: 1px solid var(--color-border);
```

No box shadows. Depth is created through background color differences, not shadows.

---

## 3. Layout architecture

### 3.1 Application shell

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR   Portfolio Optimization Engine          [v0.1.0]    │
├─────────────────────────┬────────────────────────────────────┤
│                         │                                    │
│  CONFIGURATION PANEL    │  RESULTS AREA                     │
│                         │                                    │
│  Asset selector         │  ┌──────────────────────────────┐ │
│  Date range             │  │  METRICS ROW                 │ │
│  Strategy toggle        │  │  Return / Risk / Sharpe /    │ │
│  Risk objective         │  │  Drawdown / VaR / CVaR       │ │
│  BL views (conditional) │  └──────────────────────────────┘ │
│                         │                                    │
│  [ OPTIMIZE ]           │  ┌──────────────────────────────┐ │
│                         │  │  EFFICIENT FRONTIER CHART    │ │
│  ~320px fixed width     │  │  (interactive scatter)       │ │
│                         │  └──────────────────────────────┘ │
│                         │                                    │
│                         │  ┌────────────┬─────────────────┐ │
│                         │  │ ALLOCATION │ MODEL COMPARISON │ │
│                         │  │ BAR CHART  │ TABLE           │ │
│                         │  └────────────┴─────────────────┘ │
└─────────────────────────┴────────────────────────────────────┘
```

### 3.2 Responsive behaviour

| Breakpoint | Layout |
|---|---|
| `< 900px` | Config panel full-width at top, results stacked below |
| `900px – 1279px` | Side-by-side, 300px / flex-1 |
| `≥ 1280px` | Side-by-side, 320px / flex-1 |

---

## 4. Component specifications

### 4.1 ConfigPanel

The left panel. Contains all user inputs. Sections:

**Asset Selector**
- Grid of asset ticker chips (AAPL, MSFT, NVDA, etc.), grouped by sector
- Selected state: `--color-accent` border + `--color-accent-dim` background
- Unselected: `--color-surface-raised` background, `--color-border` border
- Minimum 2 assets must be selected to enable the Optimize button

**Date Range**
- Two date inputs: Start Date, End Date
- Labels in `--text-small`, inputs in `--text-body`
- Validation: end date must be after start date, range must be ≥ 1 year

**Strategy Toggle**
- Three-option segmented control: `Historical` | `ML Enhanced` | `Black-Litterman`
- Each option maps to a backend `method` value: `historical` | `ml` | `bl`
- Active option: `--color-accent` background

**Risk Objective**
- Three radio options: `Minimum Variance` | `Maximum Sharpe` | `Target Return`
- Target Return option reveals a numeric input when selected

**Black-Litterman Views** (visible only when strategy = Black-Litterman)
- Table where each row is one asset view
- Columns: Asset | Expected Return Override (%) | Confidence (%)
- Add/remove row buttons
- Styled as a compact form table

**Optimize Button**
- Full width of the panel
- Label: `Optimize Portfolio` in idle state, `Optimizing…` with a spinner during loading
- Disabled when fewer than 2 assets selected or date range invalid
- Background: `--color-accent`, text: white

### 4.2 MetricsRow

Six metric cards in a horizontal row above the charts.

Each card:
- Label in `--text-small`, `--color-text-secondary`
- Value in `--text-value`, `--text-mono` face
- Value color: `--color-positive` for Expected Return and Sharpe, `--color-negative` for Max Drawdown / VaR / CVaR, `--color-text-primary` for Volatility

| Card | Value format |
|---|---|
| Expected Return | `+14.7%` |
| Volatility | `11.2%` |
| Sharpe Ratio | `1.21` |
| Max Drawdown | `-13.4%` |
| VaR (95%) | `-2.8%` |
| CVaR (95%) | `-4.1%` |

Show skeleton placeholder cards while loading. Do not show empty cards.

### 4.3 EfficientFrontierChart

The most important component in the product.

Built with **Recharts** `ScatterChart`.

- X axis: Volatility (Risk) — label: `Risk (Volatility %)`
- Y axis: Expected Return — label: `Expected Return %`
- The frontier curve: a `Line` connecting all frontier portfolio points, color `--color-frontier`
- Special markers plotted on top of the curve:
  - `★` Maximum Sharpe Portfolio — `--color-traditional` (blue)
  - `●` Minimum Variance Portfolio — `--color-positive` (green)
  - If ML strategy: `◆` ML Portfolio — `--color-ml` (purple)
  - If BL strategy: `◆` BL Portfolio — `--color-bl` (cyan)

**Hover tooltip (most important interaction):**

When a user hovers over any point on the frontier, a tooltip appears showing:

```
Portfolio #47
─────────────────────
Expected Return   14.7%
Volatility        11.2%
Sharpe Ratio       1.21
─────────────────────
Allocation
AAPL              22%  ████████
MSFT              28%  ██████████
NVDA              12%  ████
JPM               16%  ██████
XOM               10%  ████
KO                12%  ████
─────────────────────
```

Tooltip styled with `--color-surface-raised` background, `--color-border` border, `--text-small` for labels, `--text-mono` for values.

The inline mini-bars in the tooltip use `--color-accent` fill.

### 4.4 AllocationChart

Horizontal bar chart showing the optimized portfolio weights.

- Each bar: asset name on the left, percentage on the right, bar colored by sector group
- Bars sorted by weight descending
- Built with Recharts `BarChart` horizontal layout
- No legend — the asset names are the labels

Sector color mapping:
| Sector | Color |
|---|---|
| Technology | `#6366F1` |
| Finance | `#3B82F6` |
| Healthcare | `#10B981` |
| Consumer | `#F59E0B` |
| Energy | `#EF4444` |

### 4.5 ComparisonTable

Side-by-side table comparing up to three strategies (Historical, ML, Black-Litterman).

| Metric | Historical | ML Enhanced | Black-Litterman |
|---|---|---|---|
| Expected Return | 11.8% | 14.1% | 13.2% |
| Volatility | 10.2% | 11.5% | 10.8% |
| Sharpe Ratio | 1.05 | 1.12 | 1.09 |
| Max Drawdown | -14% | -16% | -13% |
| VaR (95%) | -2.3% | -2.8% | -2.5% |
| CVaR (95%) | -3.5% | -4.2% | -3.8% |

Columns for strategies that haven't been run yet are shown as `—`.
Best value in each row highlighted with `--color-positive-dim` background.

### 4.6 LoadingState

While the backend is optimizing:
- The results area shows a centered spinner with the text `Running optimization…`
- The Optimize button shows `Optimizing…` with a small inline spinner
- The config panel inputs are disabled

### 4.7 ErrorState

If the backend returns an error:
- A banner at the top of the results area in `--color-negative-dim` background
- Icon + message text: the error string from the API response
- A retry button

---

## 5. Motion principles

**One rule: motion confirms a result, it does not decorate the interface.**

| Event | Motion |
|---|---|
| Optimization completes | Metrics cards fade in, 200ms staggered |
| Chart data arrives | Frontier points draw in left-to-right over 400ms |
| Strategy toggle | Instant — no transition |
| Asset chip select | Background color transition, 120ms |
| Tooltip appear | Opacity 0→1, 100ms |
| Loading spinner | Standard CSS rotation, no custom keyframes |

No page-load animations. No hover lift effects on cards. No scroll-reveal.

---

## 6. Accessibility

- All numeric values have `aria-label` with full context: `aria-label="Expected return: 14.7 percent"`
- Chart has `role="img"` with `aria-label` describing what it shows
- All interactive elements have visible focus ring: `outline: 2px solid var(--color-accent); outline-offset: 2px`
- Color is never the sole differentiator — portfolio type labels always accompany colored markers
- `prefers-reduced-motion`: disable all chart draw animations and card stagger

---

## 7. Error and empty states

| State | Display |
|---|---|
| No assets selected | Optimize button disabled, tooltip: "Select at least 2 assets" |
| Invalid date range | Inline error below date inputs |
| Backend error | Error banner in results area with error message |
| No results yet | Results area shows: centered illustration + "Configure your portfolio and click Optimize" |
| Strategy not yet run | ComparisonTable column shows `—` for that strategy |

---

## 8. What to avoid

- No gradient backgrounds
- No animated number counters (they obscure the actual value during loading)
- No pie charts for allocation (bar charts are more readable for > 5 assets)
- No tooltips that clip outside the viewport
- No font sizes below 11px
- No color combinations that fail WCAG AA contrast

---

## 9. Component libraries — approved sources

You do **not** need to build every UI primitive from scratch. The following external sources are explicitly approved:

| Library | npm package | Use for |
|---|---|---|
| **Lucide React** | `lucide-react` | All icons — never use emoji or inline SVG strings |
| **ReactBits** | (copy patterns) | Animated cards, glass effects, motion patterns |
| **UIverse** | (copy CSS/markup) | Toggle switches, checkboxes, loaders, button styles |

### Rules when pulling from external sources

1. **Icons must use Lucide React** — import named icons, never use raw SVG or emoji for UI icons.
2. **No full UI kits** — do not install Shadcn, MUI, Ant Design, or Chakra. We own the design system.
3. **CSS-only UIverse patterns are fine** — paste styles as Tailwind `@apply` utilities or as minimal inline classes.
4. **ReactBits motion patterns** — allowed via `framer-motion` if installed, but keep animation durations ≤ 300 ms to preserve the analytical feel.
5. **All external code must still follow our rules** — no `any`, no inline styles, no hardcoded colors outside Tailwind tokens.
6. **Credit the source** in a comment if you copy a non-trivial pattern: `// adapted from UIverse — card-glow pattern`

