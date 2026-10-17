from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router
from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Portfolio Optimization Engine",
    version=settings.version,
    description="Markowitz, ML-enhanced, and Black-Litterman portfolio optimization API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup() -> None:
    logger.info("Portfolio Optimization Engine v%s starting", settings.version)
    settings.cache_dir.mkdir(exist_ok=True)
    logger.info("Data cache directory: %s", settings.cache_dir)
