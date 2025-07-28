# AI Assist API

FastAPI backend for the AI Assist application.

## Development Setup

1. Install dependencies with uv:
```bash
uv pip install -e ".[dev]"
```

2. Run the development server:
```bash
uv run python main.py
```

## Linting and Type Checking

```bash
# Format code
uv run ruff format .

# Lint code
uv run ruff check . --fix

# Type check
uv run basedpyright
```

## Testing

```bash
uv run pytest
```