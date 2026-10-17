from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration loaded from .env and environment."""

    # Paths
    project_root: Path = Path(__file__).resolve().parents[2]
    cache_dir: Path = project_root / "data_cache"

    # API
    port: int = 8000
    version: str = "0.1.0"

    # Finance
    risk_free_rate: float = 0.05
    trading_days_per_year: int = 252
    min_history_days: int = 252      # minimum 1 year of data required
    frontier_points: int = 500       # number of points on the Efficient Frontier

    # ML (Phase 3 — defined here so config is complete)
    rf_n_estimators: int = 200
    rf_max_depth: int = 5
    ridge_alpha: float = 1.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
