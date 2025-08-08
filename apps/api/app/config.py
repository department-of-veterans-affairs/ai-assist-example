from typing import ClassVar

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore unknown env vars
    )

    # Core settings
    environment: str = "development"
    debug: bool = True

    # CORS configuration - should come from environment
    cors_origins_str: str = Field(default="", alias="CORS_ORIGINS")

    # API configuration
    api_prefix: str = "/api"

    # Logging
    log_level: str = "INFO"

    # Azure OpenAI Configuration
    azure_openai_endpoint: str = Field(default="", alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: str = Field(default="", alias="AZURE_OPENAI_API_KEY")
    azure_openai_deployment_name: str = Field(
        default="gpt-4o", alias="AZURE_OPENAI_DEPLOYMENT_NAME"
    )
    azure_openai_api_version: str = Field(
        default="2025-03-01-preview", alias="AZURE_OPENAI_API_VERSION"
    )
    azure_client_id: str = Field(
        default="", alias="AZURE_CLIENT_ID"
    )  # For managed identity

    # Vista MCP Configuration
    vista_mcp_server_url: str = Field(
        default="http://localhost:8000/sse", alias="VISTA_MCP_SERVER_URL"
    )
    vista_api_token: str = Field(default="", alias="VISTA_API_TOKEN")

    # Rate limiting configuration (environment-specific)
    rate_limit_delay_ms: int = Field(
        default=0,
        alias="RATE_LIMIT_DELAY_MS",
        description="Delay in milliseconds between requests (0 = no delay)",
    )
    enable_retry_on_rate_limit: bool = Field(
        default=True,
        alias="ENABLE_RETRY_ON_RATE_LIMIT",
        description="Whether to automatically retry on rate limit errors",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from string or return defaults for development."""
        if self.cors_origins_str.strip():
            return [origin.strip() for origin in self.cors_origins_str.split(",")]
        # Default CORS origins for development if none provided
        return ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production", "test"}
        if v.lower() not in allowed:
            raise ValueError(f"Environment must be one of: {allowed}")
        return v.lower()

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
