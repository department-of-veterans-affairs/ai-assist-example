"""Utilities for throttling Azure OpenAI usage."""

from __future__ import annotations

import asyncio
import logging
import random
from typing import TYPE_CHECKING, TypeVar

from openai import APIStatusError, RateLimitError

if TYPE_CHECKING:
    from collections.abc import Awaitable, Callable

logger = logging.getLogger(__name__)

T = TypeVar("T")


class AzureRateLimiter:
    """Async rate limiter with retry/backoff for Azure OpenAI calls."""

    _semaphore: asyncio.Semaphore
    _max_attempts: int
    _base_delay_seconds: float
    _jitter_seconds: float

    def __init__(
        self,
        max_concurrency: int,
        max_attempts: int,
        base_delay_seconds: float,
        jitter_seconds: float,
    ) -> None:
        if max_concurrency < 1:
            raise ValueError("max_concurrency must be >= 1")
        if max_attempts < 1:
            raise ValueError("max_attempts must be >= 1")

        self._semaphore = asyncio.Semaphore(max_concurrency)
        self._max_attempts = max_attempts
        self._base_delay_seconds = base_delay_seconds
        self._jitter_seconds = jitter_seconds

    async def run(self, task_factory: Callable[[], Awaitable[T]]) -> T:
        """Execute the coroutine returned by ``task_factory`` with retry handling."""

        async with self._semaphore:
            attempt = 1
            while True:
                try:
                    return await task_factory()
                except Exception as exc:
                    if not self._should_retry(exc, attempt):
                        raise

                    delay = self._compute_delay(attempt)
                    logger.warning(
                        "Azure OpenAI rate limited (attempt %s/%s), retrying in %.2fs",
                        attempt,
                        self._max_attempts,
                        delay,
                    )
                    await asyncio.sleep(delay)
                    attempt += 1

    def _should_retry(self, exc: Exception, attempt: int) -> bool:
        if attempt >= self._max_attempts:
            return False

        if isinstance(exc, RateLimitError):
            return True

        if isinstance(exc, APIStatusError) and exc.status_code in {429, 503}:
            return True

        status_code = getattr(exc, "status_code", None)
        if status_code in {429, 503}:
            return True

        message = str(exc).lower()
        return "rate limit" in message or "too many requests" in message

    def _compute_delay(self, attempt: int) -> float:
        base_delay: float = self._base_delay_seconds
        backoff: float = base_delay * (2.0 ** (attempt - 1))
        jitter: float = (
            random.uniform(0.0, self._jitter_seconds)
            if self._jitter_seconds > 0
            else 0.0
        )
        return backoff + jitter
