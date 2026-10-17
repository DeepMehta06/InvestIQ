from fastapi import APIRouter
from backend.api.models import OptimizeRequest
from backend.core.config import settings
from backend.core.logger import get_logger
from backend.data.fetcher import fetch_prices, compute_log_returns
from backend.optimization.stub import stub_optimize, stub_metrics, stub_frontier

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1")

@router.get("/health")
async def health() -> dict:
    """Health check endpoint.

    Returns:
        JSON with service status and version.
    """
    logger.info("Health check called")
    return {
        "success": True,
        "data": {
            "status": "ok",
            "version": settings.version,
        },
        "error": None,
    }

@router.post("/optimize")
async def optimize(request: OptimizeRequest) -> dict:
    """Run portfolio optimization and return weights, metrics, and frontier.

    Phase 1: Uses stub optimizer — returns uniform weights and zero metrics.
    Phase 2: Replaced with real Markowitz, ML, and BL implementations.

    Args:
        request: OptimizeRequest with assets, dates, method, and objective.

    Returns:
        JSON with weights, risk metrics, Efficient Frontier, and metadata.
    """
    logger.info(
        "Optimize called — assets: %s, method: %s, objective: %s",
        request.assets, request.method, request.objective
    )

    try:
        # Phase 1: fetch real prices to validate the asset/date range
        prices = fetch_prices(request.assets, request.start_date, request.end_date)
        returns = compute_log_returns(prices)
        logger.info("Data fetched — returns shape: %s", returns.shape)

        # Phase 1: stub weights and metrics (replaced in Phase 2)
        weights = stub_optimize(request.assets)
        metrics = stub_metrics()
        frontier = stub_frontier(request.assets)

        return {
            "success": True,
            "data": {
                "weights": weights,
                "metrics": metrics,
                "frontier": frontier,
                "method": request.method,
                "objective": request.objective,
                "assets": request.assets,
                "date_range": {
                    "start": request.start_date,
                    "end": request.end_date,
                },
            },
            "error": None,
        }

    except ValueError as e:
        logger.warning("Validation error in /optimize: %s", e)
        return {
            "success": False,
            "data": None,
            "error": str(e),
        }
    except Exception as e:
        logger.error("Unexpected error in /optimize: %s", e, exc_info=True)
        return {
            "success": False,
            "data": None,
            "error": "Internal server error. Check backend logs.",
        }
