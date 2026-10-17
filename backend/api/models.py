from pydantic import BaseModel, field_validator
from typing import Optional

class BLView(BaseModel):
    """A single Black-Litterman investor view."""
    asset: str
    expected_return: float   # decimal, e.g. 0.25
    confidence: float        # decimal, 0.0 – 1.0

    @field_validator("confidence")
    @classmethod
    def confidence_in_range(cls, v: float) -> float:
        if not 0.0 < v <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        return v

class OptimizeRequest(BaseModel):
    """Request body for POST /api/v1/optimize."""
    assets: list[str]
    start_date: str          # YYYY-MM-DD
    end_date: str            # YYYY-MM-DD
    method: str               # "historical" | "ml" | "bl"
    objective: str            # "max_sharpe" | "min_variance" | "target_return"
    risk_free_rate: float = 0.05
    target_return: Optional[float] = None
    bl_views: Optional[list[BLView]] = None

    @field_validator("method")
    @classmethod
    def valid_method(cls, v: str) -> str:
        if v not in ("historical", "ml", "bl"):
            raise ValueError(f"method must be one of: historical, ml, bl. Got: {v}")
        return v

    @field_validator("objective")
    @classmethod
    def valid_objective(cls, v: str) -> str:
        if v not in ("max_sharpe", "min_variance", "target_return"):
            raise ValueError(f"objective must be one of: max_sharpe, min_variance, target_return. Got: {v}")
        return v

    @field_validator("assets")
    @classmethod
    def min_assets(cls, v: list[str]) -> list[str]:
        if len(v) < 2:
            raise ValueError("At least 2 assets are required for optimization.")
        return v
