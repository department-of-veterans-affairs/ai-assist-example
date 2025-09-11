import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import chat, health, summary, user
from .services.tracing import initialize_langsmith_tracing

# Initialize LangSmith tracing if enabled
initialize_langsmith_tracing()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Manage application lifecycle events"""
    # Startup
    logger = logging.getLogger(__name__)
    logger.info("Starting VA AI Assist API")

    # LangSmith tracing is already initialized above
    if settings.langsmith_tracing and settings.langsmith_api_key:
        logger.info(
            f"LangSmith tracing active for project: {settings.langsmith_project}"
        )
    else:
        logger.info("LangSmith tracing is disabled")

    logger.info(f"Environment: {settings.environment}")
    logger.info(f"CORS origins: {settings.cors_origins}")

    yield

    # Shutdown
    logger.info("Shutting down VA AI Assist API")


# Root path based on environment (use prefix only when deployed, not localhost)
# In local development, we don't set ROOT_PATH_PREFIX
# In ECS deployment, terraform sets ROOT_PATH_PREFIX="/ai-assist-api"
root_path = os.getenv("ROOT_PATH_PREFIX", "")

# Enhanced FastAPI app with proper OpenAPI configuration
app = FastAPI(
    title="VA AI Assist API",
    description="""
    FastAPI backend for AI Assist application.

    This API provides:
    * Health monitoring endpoints
    * CORS support for web clients
    * Automatic OpenAPI documentation
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    root_path=root_path,  # Handle ALB path prefix only in deployment
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint for basic API info"""
    return {"message": "AI Assist API", "status": "running", "docs": "/docs"}


# Include routers with proper tags
app.include_router(router=health.router, prefix="/api", tags=["health"])
app.include_router(router=chat.router, prefix="/api", tags=["chat"])
app.include_router(router=summary.router, prefix="/api/summary", tags=["summary"])
app.include_router(router=user.router, prefix="/api", tags=["user"])
