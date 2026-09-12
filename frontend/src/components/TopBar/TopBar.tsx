import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';

/**
 * Application top bar with project title and backend health indicator.
 * Polls /health on mount; shows green dot when backend is alive, red when not.
 */
export default function TopBar() {
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    apiService
      .health()
      .then((r) => setHealthy(r.success))
      .catch(() => setHealthy(false));
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-accent font-mono font-semibold text-lg">IQ</span>
        <span className="text-heading font-semibold tracking-tight text-primary">
          Portfolio Optimization Engine
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            healthy === true
              ? 'bg-positive animate-pulse'
              : healthy === false
                ? 'bg-negative'
                : 'bg-muted'
          }`}
        />
        <span className="text-small text-secondary font-mono">
          {healthy === true ? 'Backend connected' : healthy === false ? 'Backend offline' : 'Checking…'}
        </span>
      </div>
    </header>
  );
}
