import { TrendingUp, ChartNoAxesColumn } from 'lucide-react';
import MetricsRow from '../MetricsRow/MetricsRow';
import { usePortfolioStore } from '../../store/usePortfolioStore';

/**
 * Main results area. Handles four states:
 * - idle: empty state with illustration prompt
 * - loading: delegated to MetricsRow skeleton
 * - error: red error banner
 * - success: MetricsRow + Phase 5 chart placeholder
 */
export default function ResultsArea() {
  const { loadingState, errorMessage, activeResult } = usePortfolioStore();

  if (loadingState === 'idle' && !activeResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center">
          <TrendingUp size={32} className="text-accent" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-heading text-primary font-semibold">
            Configure your portfolio and click Optimize
          </p>
          <p className="text-body text-secondary">
            Select assets, choose a strategy, and run the engine.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          {(['Historical', 'ML-Enhanced', 'Black-Litterman'] as const).map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-full border border-border text-small text-muted"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (loadingState === 'error' && errorMessage) {
    return (
      <div className="bg-negative-dim border border-negative rounded-lg p-4 text-negative text-body flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">⚠</span>
        <span>{errorMessage}</span>
      </div>
    );
  }

  return (
    <div>
      <MetricsRow />
      {/* Phase 5: EfficientFrontierChart, AllocationChart, ComparisonTable */}
      <div
        className="bg-surface border border-border border-dashed rounded-lg p-12
          flex flex-col items-center justify-center gap-3 text-secondary"
      >
        <ChartNoAxesColumn size={40} className="text-muted" />
        <p className="text-body text-secondary">Charts will render here in Phase 5</p>
        <p className="text-small text-muted">
          Efficient Frontier · Allocation Bar · Strategy Comparison
        </p>
      </div>
    </div>
  );
}
