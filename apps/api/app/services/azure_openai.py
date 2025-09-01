"""Azure OpenAI client service with managed identity support."""

from agents import set_default_openai_client
from azure.identity import ManagedIdentityCredential
from openai import AsyncAzureOpenAI

from ..config import settings


def create_azure_openai_client() -> AsyncAzureOpenAI:
    """
    Create Azure OpenAI client for AWS deployment with managed identity support.

    Returns:
        AsyncAzureOpenAI: Configured Azure OpenAI client
    """
    # Production AWS with managed identity
    if settings.azure_client_id:
        credential = ManagedIdentityCredential(client_id=settings.azure_client_id)
        token = credential.get_token("https://cognitiveservices.azure.com/.default")

        client = AsyncAzureOpenAI(
            azure_ad_token=token.token,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )
    # Local development with API key
    else:
        client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )

    # Set as default for all agents
    set_default_openai_client(client)
    return client
