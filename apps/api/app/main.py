import logging

from agents import enable_verbose_stdout_logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import chat, health

# Enable verbose logging for OpenAI Agents SDK
enable_verbose_stdout_logging()

# Configure the OpenAI Agents SDK logger specifically
agents_logger = logging.getLogger("openai.agents")
agents_logger.setLevel(logging.DEBUG)  # Show all agent activity

# Also configure the tracing logger if needed
tracing_logger = logging.getLogger("openai.agents.tracing")
tracing_logger.setLevel(logging.DEBUG)

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
app.include_router(router=chat.router, prefix="/api", tags=["chat"])
