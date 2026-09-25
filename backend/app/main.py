from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    FeedbackIntelligenceException,
    ResourceNotFoundException,
    DuplicateFeedbackException,
    ValidationError as CustomValidationError,
)
from app.db.database import init_db, engine
from app.api.routes import feedback


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' environment...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as exc:
        logger.error(f"Error during database initialization: {exc}")
    yield
    # Shutdown
    logger.info("Shutting down Feedback Intelligence Platform.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="""
# Feedback Intelligence Platform Backend API

Converts high-volume unstructured customer feedback across any source into:
* Preprocessed & deduplicated clean feedback
* RoBERTa-based sentiment analysis
* DistilBERT-based intent classification
* BGE embeddings & pgvector semantic search
* HDBSCAN & BERTopic automated problem discovery
* Dynamic trend & emerging issue detection
* Explainable priority scoring
* Evidence-backed product recommendations
* LLM-synthesized executive problem insights with complete audit traceability
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(FeedbackIntelligenceException)
async def domain_exception_handler(request: Request, exc: FeedbackIntelligenceException):
    logger.warning(f"Domain exception: {exc.message} | Details: {exc.details}")
    status_code = status.HTTP_400_BAD_REQUEST
    if isinstance(exc, ResourceNotFoundException):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, DuplicateFeedbackException):
        status_code = status.HTTP_409_CONFLICT

    return JSONResponse(
        status_code=status_code,
        content={"error": exc.__class__.__name__, "message": exc.message, "details": exc.details},
    )


from fastapi.encoders import jsonable_encoder


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "message": "Input validation failed",
            "details": jsonable_encoder(exc.errors()),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "InternalServerError", "message": "An unexpected error occurred."},
    )


# Health & Readiness Endpoints
@app.get("/health", tags=["System Health"], summary="Liveness Probe")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/ready", tags=["System Health"], summary="Readiness Probe")
def readiness_check() -> Dict[str, Any]:
    db_status = "connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    is_ready = db_status == "connected"
    return {
        "status": "ready" if is_ready else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
    }


# Include Routers
app.include_router(feedback.router, prefix=settings.API_V1_STR)
