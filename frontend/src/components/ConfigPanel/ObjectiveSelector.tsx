import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { OptimizationObjective } from '../../types';

interface ObjectiveOption {
  /** Internal objective identifier */
  value: OptimizationObjective;
  /** Display label */
  label: string;
  /** One-line description of what this objective does */
  description: string;
}

const OBJECTIVES: ObjectiveOption[] = [
  {
    value: 'max_sharpe',
    label: 'Max Sharpe',
    description: 'Highest risk-adjusted return',
  },
  {
    value: 'min_variance',
    label: 'Min Variance',
    description: 'Lowest portfolio volatility',
  },
  {
    value: 'target_return',
    label: 'Target Return',
    description: 'Hit a specified return',
  },
];

/**
 * Radio group for selecting the optimization objective.
 * When Target Return is selected, reveals a numeric input for the target value.
 */
export default function ObjectiveSelector() {
  const { objective, targetReturn, setObjective, setTargetReturn } = usePortfolioStore();

  return (
    <div className="flex flex-col gap-1.5">
      {OBJECTIVES.map(({ value, label, description }) => {
        const isActive = objective === value;
        return (
          <label
            key={value}
            htmlFor={`objective-${value}`}
            className={`
              flex items-start gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer
              transition-all duration-150
              ${
                isActive
                  ? 'bg-accent-dim border-accent'
                  : 'bg-surface-raised border-border hover:border-secondary'
              }
            `}
          >
            {/* Custom radio — UIverse-inspired dot-inside-circle */}
            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150 border-accent">
              {isActive && <div className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            <input
              id={`objective-${value}`}
              type="radio"
              name="objective"
              value={value}
              checked={isActive}
              onChange={() => setObjective(value)}
              className="sr-only"
            />
            <div className="flex flex-col min-w-0">
              <span
                className={`text-small font-semibold leading-none ${isActive ? 'text-primary' : 'text-secondary'}`}
              >
                {label}
              </span>
              <span className="text-small text-muted leading-none mt-0.5">{description}</span>
            </div>
          </label>
        );
      })}

      {/* Target return input — only shown when target_return is selected */}
      {objective === 'target_return' && (
        <div className="mt-1 flex items-center gap-2">
          <label htmlFor="target-return-input" className="text-small text-secondary whitespace-nowrap">
            Target %
          </label>
          <input
            id="target-return-input"
            type="number"
            min={0}
            max={200}
            step={0.5}
            value={targetReturn !== null ? (targetReturn * 100).toFixed(1) : ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTargetReturn(isNaN(v) ? null : v / 100);
            }}
            placeholder="e.g. 15"
            className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-small font-mono text-primary
              placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-150"
          />
        </div>
      )}
    </div>
  );
}
