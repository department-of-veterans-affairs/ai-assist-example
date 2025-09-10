# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Assist is a VA Clinical Tool built as a modern monorepo with:

- **Frontend**: React 19 with VA Clinical Design System (VACDS)
- **Backend**: FastAPI with Python 3.13
- **Infrastructure**: Docker Compose, pnpm workspaces, mise for version management

## Essential Commands

### Development

```bash
# Start both frontend and backend
pnpm dev

# Frontend only (port 3000)
pnpm dev:web

# Backend only (port 8080)
pnpm dev:api

# Build all projects
pnpm build

# Run all tests (frontend + backend)
pnpm test

# Run frontend tests only
pnpm test:web

# Run backend tests only
pnpm test:api

# Run frontend tests in watch mode
pnpm test:watch

# Initial setup
pnpm setup
```

### Code Quality - MANDATORY before suggesting commits

```bash
# Run all checks at once (format + lint + typecheck + build)
pnpm check:all  # or: mise check

# Or run individually with mise:
mise format      # Format all code
mise lint        # Lint all code
mise typecheck   # Type check all code

# Auto-fix issues
mise fix

# Run tests with mise
mise test        # Run all tests (frontend + backend)
mise test:web    # Frontend tests only
mise test:api    # Backend tests only
mise test:watch  # Frontend tests in watch mode

# Root-level biome check
pnpm check       # Runs biome check on root files
```

### Frontend-specific commands

```bash
cd apps/web
pnpm format      # Format with ultracite
pnpm lint        # Lint with ultracite
pnpm typecheck   # TypeScript validation
pnpm build       # Production build
```

### Backend-specific commands

```bash
cd apps/api
uv run ruff format .           # Format Python code
uv run ruff check .            # Lint Python code
uv run ruff check . --fix      # Auto-fix linting issues
uv run basedpyright            # Type check Python
uv run pytest                  # Run tests
uv run pytest --cov            # Run tests with coverage
```

### Testing

```bash
# Backend unit tests
cd apps/api && uv run pytest

# Run specific test
cd apps/api && uv run pytest tests/test_health.py::test_health_endpoint

# Tests with coverage
cd apps/api && uv run pytest --cov --cov-report=html
```

## Architecture Overview

### Frontend Architecture (apps/web)

**Technology Stack**:

- React 19 with functional components and TypeScript
- VA Clinical Design System (VACDS) for UI components
- Vite for build tooling with HMR
- CSS Modules for component-specific styles
- Ultracite (Biome-based) for formatting/linting

**Key Patterns**:

- VACDS components are imported directly from `@department-of-veterans-affairs/clinical-design-system`
- Styling uses VACDS utility classes ONLY - NO CSS Modules, NO SCSS
- NO arbitrary values - only VACDS components and utilities
- Components follow this pattern:

  ```typescript
  import { Card, Button } from '@department-of-veterans-affairs/clinical-design-system';
  
  // Use only utility classes for spacing/layout
  <Card className="margin-bottom-3">
    <CardBody className="padding-3">
      <Button primary>Action</Button>
    </CardBody>
  </Card>
  ```

**API Integration**:

- Vite proxies `/api` requests to `http://localhost:8080`
- Use `fetch` or preferred HTTP client for API calls

### Backend Architecture (apps/api)

**Technology Stack**:

- FastAPI with Python 3.13
- Pydantic for data validation and settings
- uv for fast package management
- Ruff for linting/formatting
- BasedPyright for type checking

**Project Structure**:

```
app/
├── config.py      # Pydantic settings management
├── main.py        # FastAPI app initialization
├── models/        # Pydantic models for requests/responses
├── routers/       # API endpoints grouped by feature
└── services/      # Business logic separated from routes
```

**Key Patterns**:

- Configuration via environment variables and `.env` files
- Routers handle HTTP concerns, services handle business logic
- All models use Pydantic for validation
- Async/await for all I/O operations
- Proper error handling with appropriate HTTP status codes

### VACDS Implementation

The frontend uses VA Clinical Design System (VACDS) components and utilities. For detailed implementation guidelines, see [VACDS Implementation Guide](../docs/vacds-guide.md).

**Key Points**:
- Use VACDS components only - no custom CSS
- Follow the 8 Clinical Design Principles
- Reference the Storybook for component usage
- Use utility classes for layout and spacing

## Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Implement changes following architecture patterns
   - Run `pnpm check` before commits
   - Write tests for new functionality

2. **Adding New API Endpoints**:
   - Create router module in `app/routers/`
   - Define Pydantic models in `app/models/`
   - Implement business logic in `app/services/`
   - Register router in `app/main.py`
   - Add tests in `tests/`

3. **Adding New UI Components**:
   - Create component in `src/components/`
   - Use VACDS components from Storybook
   - Use utility classes for spacing/layout
   - NO CSS Modules, NO SCSS, NO custom styles
   - Follow TypeScript strict mode requirements

## Environment Setup

The project uses mise for version management. Key versions:

- Node.js: 22.x LTS
- Python: 3.13
- pnpm: Latest
- uv: Latest

Environment variables:

- `ENVIRONMENT`: development, staging, production, test
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `LOG_LEVEL`: info, debug, warning, error

## Code Formatting and Linting

**Frontend uses Ultracite (Biome preset):**

- Configuration: `biome.jsonc` extends `["ultracite"]`
- Automatically removes unused imports via `noUnusedImports` rule
- VS Code automatically formats on save via Biome extension
- Run `pnpm format` or `mise fix` to format code manually

**Key Ultracite Behaviors:**

- Organizes imports alphabetically
- Removes unused imports on save (if VS Code configured properly)
- Enforces strict equality (`===` over `==`)

## Critical Rules

1. **Always run code quality checks before commits**: `mise check` or `pnpm check:all`
2. **Use VACDS design tokens only** - no custom colors or spacing
3. **Follow established patterns** - check existing code first
4. **Maintain TypeScript strict mode** - no `any` types
5. **Keep components small and focused**
6. **Separate API concerns**: routes, models, services
7. **Write tests for new functionality**
8. **Use conventional commits** - Format: `type(scope?): subject` (e.g., `feat(web): add dark mode`)
9. **Trust the formatter** - Ultracite will automatically fix quote styles, import organization, and code formatting
10. **Always use clsx for conditional classes** - Never use template literals or string concatenation for className conditionals. Always import and use clsx.

## API Documentation

- FastAPI automatic docs: <http://localhost:8080/docs>
- ReDoc alternative: <http://localhost:8080/redoc>
- OpenAPI schema: <http://localhost:8080/openapi.json>

## Common Tasks

### Add a new VACDS component

```typescript
import { Button, Alert } from '@department-of-veterans-affairs/clinical-design-system';
```

### Create an API endpoint

```python
# In app/routers/feature.py
@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int) -> ItemResponse:
    item = await item_service.get_item(item_id)
    return ItemResponse.from_orm(item)
```

### Handle API errors

```python
from fastapi import HTTPException, status

if not item:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )
```
