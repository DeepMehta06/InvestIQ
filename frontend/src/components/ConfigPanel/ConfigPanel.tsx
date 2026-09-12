import { Play, Loader2 } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useOptimize } from '../../hooks/useOptimize';
import AssetSelector from './AssetSelector';
import StrategyToggle from './StrategyToggle';
import ObjectiveSelector from './ObjectiveSelector';
import BLViewsTable from './BLViewsTable';

/** Section heading with divider line used inside the config panel. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-small text-secondary font-semibold uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/**
 * Left-panel configuration form. Contains:
 * - Date range pickers
 * - Strategy toggle (Historical / ML / BL)
 * - Objective selector (Max Sharpe / Min Variance / Target Return)
 * - Asset selector chip grid
 * - BL Views table (conditional on method === 'bl')
 * - Optimize button
 */
export default function ConfigPanel() {
  const {
    startDate,
    endDate,
    method,
    selectedAssets,
    loadingState,
    setStartDate,
    setEndDate,
  } = usePortfolioStore();

  const { runOptimization } = useOptimize();
  const isLoading = loadingState === 'loading';
  const canOptimize = selectedAssets.length >= 2 && !isLoading;

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* ── Date range ───────────────────────────────────────────── */}
      <section>
        <SectionHeading>Date Range</SectionHeading>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-small text-muted w-10 flex-shrink-0">
              From
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-md px-2.5 py-1.5 text-small font-mono text-primary
                focus:outline-none focus:border-accent transition-colors duration-150"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-small text-muted w-10 flex-shrink-0">
              To
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-md px-2.5 py-1.5 text-small font-mono text-primary
                focus:outline-none focus:border-accent transition-colors duration-150"
            />
          </div>
        </div>
      </section>

      {/* ── Strategy ─────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Strategy</SectionHeading>
        <StrategyToggle />
      </section>

      {/* ── Objective ────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Objective</SectionHeading>
        <ObjectiveSelector />
      </section>

      {/* ── BL Views (conditional) ───────────────────────────────── */}
      {method === 'bl' && (
        <section>
          <SectionHeading>BL Views</SectionHeading>
          <BLViewsTable />
        </section>
      )}

      {/* ── Assets ───────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Assets</SectionHeading>
        <AssetSelector />
      </section>

      {/* ── Optimize button ──────────────────────────────────────── */}
      <button
        id="optimize-button"
        onClick={runOptimization}
        disabled={!canOptimize}
        title={selectedAssets.length < 2 ? 'Select at least 2 assets' : ''}
        className={`
          flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-body
          transition-all duration-200
          ${
            canOptimize
              ? 'bg-accent text-white hover:bg-blue-500 active:scale-95 shadow-lg shadow-accent/20'
              : 'bg-surface-raised text-muted border border-border cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Optimizing…
          </>
        ) : (
          <>
            <Play size={16} />
            Optimize
          </>
        )}
      </button>
    </div>
  );
}
