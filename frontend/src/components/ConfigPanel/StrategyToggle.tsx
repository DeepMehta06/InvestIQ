import { TrendingUp, BrainCircuit, BarChart2 } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { OptimizationMethod } from '../../types';

interface StrategyOption {
  /** Internal method identifier */
  value: OptimizationMethod;
  /** Display label for the button */
  label: string;
  /** Short descriptor shown below the label */
  description: string;
  /** Lucide icon to render */
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const STRATEGIES: StrategyOption[] = [
  {
    value: 'historical',
    label: 'Historical',
    description: 'Mean-Variance',
    Icon: TrendingUp,
  },
  {
    value: 'ml',
    label: 'ML-Enhanced',
    description: 'Covariance est.',
    Icon: BrainCircuit,
  },
  {
    value: 'bl',
    label: 'Black-Litterman',
    description: 'Views-driven',
    Icon: BarChart2,
  },
];

/**
 * Segmented control that switches between the three optimization methods.
 * Syncs with the Zustand store `method` field.
 */
export default function StrategyToggle() {
  const { method, setMethod } = usePortfolioStore();

  return (
    <div className="flex flex-col gap-1.5">
      {STRATEGIES.map(({ value, label, description, Icon }) => {
        const isActive = method === value;
        return (
          <button
            key={value}
            id={`strategy-${value}`}
            onClick={() => setMethod(value)}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border
              text-left transition-all duration-150 cursor-pointer
              ${
                isActive
                  ? 'bg-accent-dim border-accent text-primary'
                  : 'bg-surface-raised border-border text-secondary hover:border-secondary hover:text-primary'
              }
            `}
          >
            <Icon
              size={16}
              className={isActive ? 'text-accent' : 'text-muted'}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-small font-semibold leading-none">{label}</span>
              <span className="text-small text-muted leading-none mt-0.5">{description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
