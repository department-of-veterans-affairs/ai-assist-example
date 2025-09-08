FROM python:3.13-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files and README (needed for editable install)
COPY pyproject.toml README.md ./

# Install dependencies in editable mode
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
