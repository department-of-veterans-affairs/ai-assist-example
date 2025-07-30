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
