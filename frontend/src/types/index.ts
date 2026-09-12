// ─── Request types ──────────────────────────────────────────────────────────

export type OptimizationMethod = 'historical' | 'ml' | 'bl';
export type OptimizationObjective = 'max_sharpe' | 'min_variance' | 'target_return';

export interface BLView {
  asset: string;
  expected_return: number; // decimal, e.g. 0.25 = 25%
  confidence: number; // decimal, e.g. 0.70 = 70%
}

export interface OptimizeRequest {
  assets: string[];
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  method: OptimizationMethod;
  objective: OptimizationObjective;
  risk_free_rate: number; // decimal, default 0.05
  target_return: number | null;
  bl_views: BLView[] | null;
}

// ─── Response types ──────────────────────────────────────────────────────────

export interface PortfolioWeights {
  [ticker: string]: number; // e.g. { AAPL: 0.22, MSFT: 0.28 }
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

// ─── Frontend state types ────────────────────────────────────────────────────

export interface PortfolioResult {
  method: OptimizationMethod;
  weights: PortfolioWeights;
  metrics: RiskMetrics;
  frontier: FrontierPoint[];
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ─── Asset universe ───────────────────────────────────────────────────────────

export interface Asset {
  ticker: string;
  name: string;
  sector: 'Technology' | 'Finance' | 'Healthcare' | 'Consumer' | 'Energy';
}

export const ASSET_UNIVERSE: Asset[] = [
  { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
  { ticker: 'META', name: 'Meta', sector: 'Technology' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance' },
  { ticker: 'GS', name: 'Goldman Sachs', sector: 'Finance' },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Finance' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { ticker: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { ticker: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { ticker: 'XOM', name: 'ExxonMobil', sector: 'Energy' },
  { ticker: 'CVX', name: 'Chevron', sector: 'Energy' },
];

export const SECTOR_COLORS: Record<Asset['sector'], string> = {
  Technology: '#6366F1',
  Finance: '#3B82F6',
  Healthcare: '#10B981',
  Consumer: '#F59E0B',
  Energy: '#EF4444',
};
