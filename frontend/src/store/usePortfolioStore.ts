import { create } from 'zustand';
import type {
  OptimizationMethod,
  OptimizationObjective,
  BLView,
  PortfolioResult,
  LoadingState,
} from '../types';

interface PortfolioState {
  // ─── Config ────────────────────────────────────────────────────────────────
  selectedAssets: string[];
  startDate: string;
  endDate: string;
  method: OptimizationMethod;
  objective: OptimizationObjective;
  targetReturn: number | null;
  blViews: BLView[];

  // ─── Config setters ────────────────────────────────────────────────────────
  toggleAsset: (ticker: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setMethod: (method: OptimizationMethod) => void;
  setObjective: (objective: OptimizationObjective) => void;
  setTargetReturn: (value: number | null) => void;
  setBLViews: (views: BLView[]) => void;

  // ─── Results — one slot per method ────────────────────────────────────────
  results: Partial<Record<OptimizationMethod, PortfolioResult>>;
  activeResult: PortfolioResult | null;
  setResult: (method: OptimizationMethod, result: PortfolioResult) => void;
  setActiveResult: (result: PortfolioResult | null) => void;

  // ─── Loading / error ───────────────────────────────────────────────────────
  loadingState: LoadingState;
  errorMessage: string | null;
  setLoadingState: (state: LoadingState) => void;
  setErrorMessage: (msg: string | null) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  selectedAssets: ['AAPL', 'MSFT', 'NVDA', 'JPM', 'KO'],
  startDate: '2021-01-01',
  endDate: '2025-01-01',
  method: 'historical',
  objective: 'max_sharpe',
  targetReturn: null,
  blViews: [],

  toggleAsset: (ticker) =>
    set((state) => ({
      selectedAssets: state.selectedAssets.includes(ticker)
        ? state.selectedAssets.filter((t) => t !== ticker)
        : [...state.selectedAssets, ticker],
    })),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setMethod: (method) => set({ method }),
  setObjective: (objective) => set({ objective }),
  setTargetReturn: (targetReturn) => set({ targetReturn }),
  setBLViews: (blViews) => set({ blViews }),

  results: {},
  activeResult: null,
  setResult: (method, result) =>
    set((state) => ({
      results: { ...state.results, [method]: result },
      activeResult: result,
    })),
  setActiveResult: (activeResult) => set({ activeResult }),

  loadingState: 'idle',
  errorMessage: null,
  setLoadingState: (loadingState) => set({ loadingState }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
}));
