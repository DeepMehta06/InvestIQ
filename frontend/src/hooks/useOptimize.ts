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
