import MetricCard from './MetricCard';
import { usePortfolioStore } from '../../store/usePortfolioStore';

/** Formats a decimal to a percentage string. */
function formatPct(value: number, signed = false): string {
  const pct = (value * 100).toFixed(1);
  return signed && value > 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Horizontal row of six risk metric cards.
 * Shows pulse skeleton placeholders while optimization is loading.
 */
export default function MetricsRow() {
  const { activeResult, loadingState } = usePortfolioStore();

  if (loadingState === 'loading') {
    return (
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
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
      <MetricCard
        label="Expected Return"
        value={formatPct(m.expected_return, true)}
        valueColor="text-positive"
        bgTint="bg-positive-dim"
      />
      <MetricCard
        label="Volatility"
        value={formatPct(m.volatility)}
      />
      <MetricCard
        label="Sharpe Ratio"
        value={m.sharpe_ratio.toFixed(2)}
        valueColor="text-positive"
      />
      <MetricCard
        label="Max Drawdown"
        value={formatPct(m.max_drawdown)}
        valueColor="text-negative"
        bgTint="bg-negative-dim"
      />
      <MetricCard
        label="VaR (95%)"
        value={formatPct(m.var_95)}
        valueColor="text-negative"
      />
      <MetricCard
        label="CVaR (95%)"
        value={formatPct(m.cvar_95)}
        valueColor="text-warning"
      />
    </div>
  );
}
