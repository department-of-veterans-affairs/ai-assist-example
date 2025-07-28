from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import health

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
)

# CORS middleware
app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with proper tags
app.include_router(router=health.router, prefix="/api", tags=["health"])
