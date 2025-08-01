# AI Assist - VA Clinical Tool

A modern monorepo project with React 19 frontend using VA Clinical Design System (VACDS) and FastAPI backend.

## Project Structure

```
root/
├─ apps/
│  ├─ web/            # React 19 + VACDS
│  └─ api/            # FastAPI service
├─ .mise.toml         # node, python, uv, pnpm versions
├─ pnpm-workspace.yaml
└─ docker-compose.yml # api service
```

## Quick Start

See [Quick Start Guide](./docs/quick-start.md) to get running in 5 minutes!

```bash
# Clone
git clone <repository-url> && cd ai-assist

# Setup (choose one)
mise install && mise run setup  # With mise (recommended)
pnpm setup                      # Without mise

# Run
pnpm dev
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8001>

## Technology Stack

### Frontend

- React 19 with React Router v7
- VA Clinical Design System (VACDS)
- TypeScript with strict mode
- Ultracite (AI-ready formatter based on Biome)
- Vite for fast development
- CSS Modules for styling
- Node.js 22.x LTS 'Jod'

### Backend

- FastAPI with Python 3.13
- uv for package management
- Ruff for linting/formatting
- BasedPyright for type checking

### Tools

- mise for version management
- pnpm for Node.js packages
- Docker Compose for local services

## Development Workflow

1. Frontend formatting/linting:

```bash
cd apps/web
pnpm format
pnpm lint
pnpm typecheck
```

2. Backend formatting/linting:

```bash
cd apps/api
uv run ruff format .
uv run ruff check . --fix
uv run basedpyright
```

## Documentation

- [Quick Start](./docs/quick-start.md) - Get started in 5 minutes
- [Development Guide](./docs/development.md) - Comprehensive setup and workflows
- [Code Quality](./docs/code-quality.md) - Formatting, linting, and type checking
- [VACDS Implementation](./docs/vacds-guide.md) - VA Clinical Design System guidelines

## Contributing

Please follow the established patterns and use the provided tooling for consistent code quality. See the [Development Guide](./docs/development.md) for detailed contribution guidelines.
