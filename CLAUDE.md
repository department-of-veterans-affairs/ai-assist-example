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

# Backend only (port 8001)
pnpm dev:api

# Run with Docker
pnpm docker:all
```

### Code Quality - MANDATORY before suggesting commits
```bash
# Run all checks at once (format + lint + typecheck)
mise check

# Or run individually:
mise format      # Format all code
mise lint        # Lint all code
mise typecheck   # Type check all code

# Auto-fix issues
mise fix

# Using pnpm directly (alternative):
pnpm check       # Runs format + lint + typecheck
pnpm format      # Format only
pnpm lint        # Lint only
pnpm typecheck   # Type check only
pnpm fix         # Auto-fix issues
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
- Vite proxies `/api` requests to `http://localhost:8001`
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

### VACDS Design Principles

**8 Clinical Design Principles** (must follow):
1. Complement & supplement EHR, don't replace it
2. Maximize clarity; minimize noise
3. Provide guidance with non-obtrusive feedback loops
4. Facilitate insights over raw information
5. Bridge clinical decisions & clinical actions
6. Support clinicians' sense of control
7. Configuration, not customization
8. Deliver consistency through total system approach

**Implementation Guidelines**:
- Ease cognitive burden
- Reduce noise
- Make interfaces actionable
- Provide useful context
- Train the user
- Empower clinicians

### VACDS Component-First Approach

**CRITICAL: Use VACDS React components and utility classes - NO custom CSS!**

**Import VACDS styles in main.css:**
```css
@import "@department-of-veterans-affairs/clinical-design-system/dist/core/css/utility-classes.css";
@import "@department-of-veterans-affairs/clinical-design-system/dist/core/css/typography.css";
```

**Available Utility Classes:**
- Spacing: `padding-[1-5]`, `margin-[0-5]`, `margin-bottom-[1-5]`, `margin-x-auto`
- Typography: `font-heading-[1-5]`, `font-body-[xs|sm|md|lg]`, `text-bold`
- Colors: `text-primary`, `text-base-dark`, `bg-base-lightest`, `border-primary`
- Layout: `display-flex`, `flex-gap-2`, `flex-justify-end`, `max-width-[mobile|tablet|desktop]`

**Usage Pattern:**
```tsx
// Always prefer VACDS components
<Alert status="info" className="margin-bottom-3">
  Important information
</Alert>

// Use utilities for layout only
<div className="padding-4 max-width-tablet margin-x-auto">
  <Card>...</Card>
</div>
```

### VACDS Setup

**GitHub Package Registry Authentication**:
```bash
# ~/.npmrc
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

# ./.npmrc (project root)
@department-of-veterans-affairs:registry=https://npm.pkg.github.com/
```

**Available VACDS Components**:
- Accordion, Alert, Button, Card, Chart
- Clinician Initials Button, Data Grid
- Form Controls, Modal, Toast, Tooltip
- 40+ clinical-specific components

**VACDS Resources**:
- **[Storybook](https://crispy-succotash-9k23jen.pages.github.io/) - PRIMARY REFERENCE for React components**
- [Developer Guide](https://department-of-veterans-affairs.github.io/clinical-design/how-to-use/getting-started-for-developers)
- [Design Principles](https://department-of-veterans-affairs.github.io/clinical-design/design-principles/)
- [Component Library](https://department-of-veterans-affairs.github.io/clinical-design/components/)

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
- Configuration: `apps/web/biome.jsonc` extends `["ultracite"]`
- Enforces double quotes for all strings and imports
- Automatically removes unused imports via `noUnusedImports` rule
- VS Code automatically formats on save via Biome extension
- Run `pnpm format` or `mise fix` to format code manually

**Key Ultracite Behaviors:**
- Converts single quotes to double quotes automatically
- Organizes imports alphabetically
- Removes unused imports on save (if VS Code configured properly)
- Enforces strict equality (`===` over `==`)
- Template literal conversions for string concatenation

## Critical Rules

1. **Always run code quality checks before commits**: `mise check` or `pnpm check`
2. **Use VACDS design tokens only** - no custom colors or spacing
3. **Follow established patterns** - check existing code first
4. **Maintain TypeScript strict mode** - no `any` types
5. **Keep components small and focused**
6. **Separate API concerns**: routes, models, services
7. **Write tests for new functionality**
8. **Use semantic commit messages**
9. **Use double quotes for imports and strings in TypeScript/JavaScript** - project uses Ultracite (Biome preset) which enforces double quotes
10. **Trust the formatter** - Ultracite will automatically fix quote styles, import organization, and code formatting
11. **Always use clsx for conditional classes** - Never use template literals or string concatenation for className conditionals. Always import and use clsx.

## API Documentation

- FastAPI automatic docs: http://localhost:8001/docs
- ReDoc alternative: http://localhost:8001/redoc
- OpenAPI schema: http://localhost:8001/openapi.json

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