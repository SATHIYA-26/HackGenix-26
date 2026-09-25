import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.v1.api import api_router
from backend.app.core.config import settings
from backend.app.core.exceptions import AppException

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("feedback_intelligence")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Feedback Intelligence API (%s mode)", settings.ENVIRONMENT)
    yield
    logger.info("Shutting down Feedback Intelligence API")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Feedback Intelligence: Unified SaaS platform for ingesting customer feedback "
        "from multiple sources. Module 1: Official YouTube Comments Ingestion."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "youtube_api_configured": bool(
            settings.YOUTUBE_API_KEY
            and settings.YOUTUBE_API_KEY.strip() != ""
            and "your_youtube_api_key" not in settings.YOUTUBE_API_KEY
        ),
    }


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also expose direct /youtube route alias for root convenience
app.include_router(api_router, prefix="")
