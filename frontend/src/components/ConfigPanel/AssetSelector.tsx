import { ASSET_UNIVERSE, SECTOR_COLORS } from '../../types';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import type { Asset } from '../../types';

/** Groups the asset universe by sector for display. */
function groupBySector(assets: Asset[]): Record<string, Asset[]> {
  return assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    if (!acc[asset.sector]) acc[asset.sector] = [];
    acc[asset.sector].push(asset);
    return acc;
  }, {});
}

/**
 * Asset selector rendered as a chip grid grouped by sector.
 * Chips toggle the asset in/out of selectedAssets in the Zustand store.
 */
export default function AssetSelector() {
  const { selectedAssets, toggleAsset } = usePortfolioStore();
  const grouped = groupBySector(ASSET_UNIVERSE);

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(grouped).map(([sector, assets]) => (
        <div key={sector}>
          <p
            className="text-small font-semibold mb-1.5 uppercase tracking-wider"
            style={{ color: SECTOR_COLORS[sector as Asset['sector']] }}
          >
            {sector}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assets.map((asset) => {
              const isSelected = selectedAssets.includes(asset.ticker);
              return (
                <button
                  key={asset.ticker}
                  id={`asset-chip-${asset.ticker}`}
                  onClick={() => toggleAsset(asset.ticker)}
                  title={asset.name}
                  className={`
                    px-2.5 py-1 rounded-md text-small font-mono font-medium
                    border transition-all duration-150 cursor-pointer
                    ${
                      isSelected
                        ? 'bg-accent-dim border-accent text-accent'
                        : 'bg-surface-raised border-border text-secondary hover:border-secondary hover:text-primary'
                    }
                  `}
                >
                  {asset.ticker}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-small text-muted">
        {selectedAssets.length} selected
        {selectedAssets.length < 2 && (
          <span className="text-warning ml-1">— select at least 2</span>
        )}
      </p>
    </div>
  );
}
