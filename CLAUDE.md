# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Assist is a VA Clinical Tool built as a modern monorepo with:

- **Frontend**: React 19 with VA Clinical Design System (VACDS), React Router v7, Zustand for state management
- **Backend**: FastAPI with Python 3.13, OpenAI Agents, Azure OpenAI integration, LangSmith tracing
- **Infrastructure**: Docker Compose, pnpm workspaces, mise for version management
- **Authentication**: SMART on FHIR with fhirclient
- **Testing**: Vitest (frontend), pytest (backend)
- **AI Features**: Chat interface with streaming, AI SDK integration

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
- Vite for build tooling with HMR and path-based routing support
- React Router v7 for routing
- Zustand for state management
- TanStack Query for server state management
- AI SDK (@ai-sdk/react) for AI chat integration
- fhirclient for SMART on FHIR authentication
- Ultracite (Biome-based) for formatting/linting
- Vitest + Testing Library for testing

**Key Patterns**:

- VACDS components are imported directly from `@department-of-veterans-affairs/clinical-design-system`
- Styling uses VACDS utility classes ONLY - NO CSS Modules, NO SCSS
- NO arbitrary values - only VACDS components and utilities
- Always use `clsx` for conditional className logic
- State management with Zustand for global state
- SMART on FHIR integration for healthcare authentication
- Components follow this pattern:

  ```typescript
  import { Card, Button } from '@department-of-veterans-affairs/clinical-design-system';
  import clsx from 'clsx';
  
  // Use only utility classes for spacing/layout
  <Card className="margin-bottom-3">
    <CardBody className="padding-3">
      <Button 
        primary
        className={clsx('custom-spacing', isActive && 'active-state')}
      >
        Action
      </Button>
    </CardBody>
  </Card>
  ```

**API Integration**:

- Vite proxies `/api` requests to `http://localhost:8080`
- Use `fetch` or preferred HTTP client for API calls

### Backend Architecture (apps/api)

**Technology Stack**:

- FastAPI with Python 3.13 and async/await patterns
- Pydantic for data validation and settings
- OpenAI Agents framework for AI functionality
- Azure OpenAI integration for chat completions
- LangSmith for observability and tracing
- uv for fast package management
- Ruff for linting/formatting with comprehensive rules
- BasedPyright for strict type checking
- pytest with asyncio and coverage support

**Project Structure**:

```text
app/
├── config.py      # Pydantic settings management
├── main.py        # FastAPI app initialization with CORS and lifecycle
├── agents/        # OpenAI agents for AI functionality
├── models/        # Pydantic models for requests/responses
├── routers/       # API endpoints grouped by feature (health, chat)
└── services/      # Business logic (Azure OpenAI, MCP client, tracing)
```

**Key Patterns**:

- Configuration via environment variables and `.env` files with Pydantic Settings
- Routers handle HTTP concerns, services handle business logic
- All models use Pydantic for validation and serialization
- Async/await for all I/O operations
- Proper error handling with appropriate HTTP status codes
- OpenAI Agents framework for structured AI interactions
- LangSmith integration for tracing and observability
- MCP (Model Context Protocol) client for external integrations
- Azure OpenAI for chat completions with streaming support

### VACDS Implementation

The frontend uses VA Clinical Design System (VACDS) components and utilities. For detailed implementation guidelines, see [VACDS Implementation Guide](docs/vacds-guide.md).

**Key Points**:

- Use VACDS components only - no custom CSS
- Follow the 8 Clinical Design Principles
- Reference the Storybook for component usage: <https://crispy-succotash-9k23jen.pages.github.io/>
- Use utility classes for layout and spacing
- Import styles in main.css from VACDS package
- Always use clsx for conditional className logic

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
   - Create component in `src/components/` with kebab-case naming
   - Use VACDS components from Storybook: <https://crispy-succotash-9k23jen.pages.github.io/>
   - Use utility classes for spacing/layout (reference: docs/vacds-guide.md)
   - NO CSS Modules, NO SCSS, NO custom styles
   - Always use `clsx` for conditional classes
   - Follow TypeScript strict mode requirements
   - Consider state management needs (local vs Zustand)
   - Include proper ARIA attributes for accessibility

## Environment Setup

The project uses mise for version management. Key versions:

- Node.js: 22.18.0 LTS ('Jod')
- Python: 3.13.1
- pnpm: Latest (10.13.1)
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
11. **Use kebab-case for file naming** - All component files should use kebab-case naming convention (enforced by Biome)
12. **SMART on FHIR Integration** - Use fhirclient for healthcare authentication and patient context
13. **State Management** - Use Zustand for global state, React Query for server state
14. **AI Integration** - Use AI SDK for chat functionality with streaming support

## API Documentation

- FastAPI automatic docs: <http://localhost:8080/docs>
- ReDoc alternative: <http://localhost:8080/redoc>
- OpenAPI schema: <http://localhost:8080/openapi.json>

## Common Tasks

### Add a new VACDS component

```typescript
import { Button, Alert } from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';

// Use clsx for conditional classes
<Button 
  primary
  className={clsx('margin-2', isDisabled && 'opacity-50')}
>
  Submit
</Button>
```

### Create a new frontend component

```typescript
// Use kebab-case for filename: my-component.tsx
import { Card } from '@department-of-veterans-affairs/clinical-design-system';
import clsx from 'clsx';

interface MyComponentProps {
  isActive: boolean;
  children: ReactNode;
}

export function MyComponent({ isActive, children }: MyComponentProps) {
  return (
    <Card className={clsx('padding-3', isActive && 'border-primary')}>
      {children}
    </Card>
  );
}
```

### Add Zustand state management

```typescript
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Create an API endpoint

```python
# In app/routers/feature.py
from fastapi import APIRouter, HTTPException, status
from app.models.feature import ItemResponse
from app.services import item_service

router = APIRouter()

@router.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int) -> ItemResponse:
    item = await item_service.get_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return ItemResponse.model_validate(item)
```

### Add OpenAI Agent functionality

```python
# In app/agents/
from openai_agents import Agent
from app.config import settings

class MyAgent(Agent):
    def __init__(self):
        super().__init__(
            name="my-agent",
            model=settings.azure_openai_deployment,
            instructions="You are a helpful assistant."
        )
    
    async def process_message(self, message: str) -> str:
        # Agent logic here
        pass
```
