import pytest
from httpx import AsyncClient

from backend.main import app


@pytest.mark.asyncio
async def test_health_returns_ok():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
    assert "version" in body["data"]


@pytest.mark.asyncio
async def test_optimize_fewer_than_two_assets_returns_error():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/optimize",
            json={
                "assets": ["AAPL"],
                "start_date": "2022-01-01",
                "end_date": "2025-01-01",
                "method": "historical",
                "objective": "max_sharpe",
                "risk_free_rate": 0.05,
                "target_return": None,
                "bl_views": None,
            },
        )
    assert response.status_code == 422  # Pydantic validation error


@pytest.mark.asyncio
async def test_optimize_invalid_method_returns_422():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/optimize",
            json={
                "assets": ["AAPL", "MSFT"],
                "start_date": "2022-01-01",
                "end_date": "2025-01-01",
                "method": "invalid_method",
                "objective": "max_sharpe",
                "risk_free_rate": 0.05,
                "target_return": None,
                "bl_views": None,
            },
        )
    assert response.status_code == 422
