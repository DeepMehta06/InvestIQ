import { Plus, Trash2 } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { ASSET_UNIVERSE } from '../../types';
import type { BLView } from '../../types';

/** Creates an empty BLView with defaults for a new row. */
function emptyView(): BLView {
  return { asset: ASSET_UNIVERSE[0].ticker, expected_return: 0.1, confidence: 0.7 };
}

/**
 * Table for adding and removing Black-Litterman views.
 * Only rendered when method === 'bl'. Each row: asset picker, return input, confidence slider.
 */
export default function BLViewsTable() {
  const { blViews, setBLViews } = usePortfolioStore();

  const addView = () => setBLViews([...blViews, emptyView()]);

  const removeView = (index: number) =>
    setBLViews(blViews.filter((_, i) => i !== index));

  const updateView = (index: number, patch: Partial<BLView>) =>
    setBLViews(blViews.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  return (
    <div className="flex flex-col gap-2">
      {blViews.length === 0 ? (
        <p className="text-small text-muted text-center py-3">
          No views added. Click + to add a view.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {blViews.map((view, index) => (
            <div
              key={index}
              className="bg-surface-raised border border-border rounded-lg p-2.5 flex flex-col gap-2"
            >
              {/* Asset picker */}
              <div className="flex items-center gap-2">
                <label className="text-small text-muted w-12 flex-shrink-0">Asset</label>
                <select
                  id={`bl-asset-${index}`}
                  value={view.asset}
                  onChange={(e) => updateView(index, { asset: e.target.value })}
                  className="flex-1 bg-surface border border-border rounded px-2 py-1 text-small font-mono text-primary
                    focus:outline-none focus:border-accent transition-colors duration-150"
                >
                  {ASSET_UNIVERSE.map((a) => (
                    <option key={a.ticker} value={a.ticker}>
                      {a.ticker} — {a.name}
                    </option>
                  ))}
                </select>
                <button
                  id={`bl-remove-${index}`}
                  onClick={() => removeView(index)}
                  className="text-muted hover:text-negative transition-colors duration-150 flex-shrink-0"
                  title="Remove view"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expected return */}
              <div className="flex items-center gap-2">
                <label className="text-small text-muted w-12 flex-shrink-0">Return</label>
                <input
                  id={`bl-return-${index}`}
                  type="number"
                  min={-100}
                  max={200}
                  step={0.5}
                  value={(view.expected_return * 100).toFixed(1)}
                  onChange={(e) =>
                    updateView(index, { expected_return: parseFloat(e.target.value) / 100 })
                  }
                  className="flex-1 bg-surface border border-border rounded px-2 py-1 text-small font-mono text-primary
                    focus:outline-none focus:border-accent transition-colors duration-150"
                />
                <span className="text-small text-muted">%</span>
              </div>

              {/* Confidence slider */}
              <div className="flex items-center gap-2">
                <label className="text-small text-muted w-12 flex-shrink-0">Conf.</label>
                <input
                  id={`bl-confidence-${index}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(view.confidence * 100)}
                  onChange={(e) =>
                    updateView(index, { confidence: parseInt(e.target.value, 10) / 100 })
                  }
                  className="flex-1 accent-accent"
                />
                <span className="text-small font-mono text-secondary w-8 text-right">
                  {Math.round(view.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        id="bl-add-view"
        onClick={addView}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-dashed
          border-border text-small text-muted hover:border-accent hover:text-accent
          transition-all duration-150 cursor-pointer"
      >
        <Plus size={14} />
        Add view
      </button>
    </div>
  );
}
