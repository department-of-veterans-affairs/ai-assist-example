# Development Guide

Comprehensive guide for AI Assist development setup and workflows.

> **Quick Start?** See [Quick Start Guide](./quick-start.md) for a 5-minute setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.18.0 LTS | Frontend runtime |
| Python | 3.13.1+ | Backend runtime |
| pnpm | Latest | Node package manager |
| uv | Latest | Python package manager |
| Docker | Latest | Local services (optional) |

### Installation Options

#### Option 1: Automated with mise (Recommended)

[mise](https://mise.jdx.dev/) manages all tool versions automatically:

```bash
# Install mise
curl https://mise.run | sh

# Install all tools
mise install
```

#### Option 2: Manual Installation

Install each tool individually:

- **Node.js**: Download from [nodejs.org](https://nodejs.org)
- **Python**: Download from [python.org](https://python.org)
- **pnpm**: `npm install -g pnpm`
- **uv**: `pip install uv`

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ai-assist
```

### 2. Configure GitHub Authentication

VACDS packages require GitHub authentication:

```bash
# Create personal access token at:
# GitHub Settings → Developer settings → Personal access tokens → Classic
# Scope: read:packages

# Add to ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

### 3. Install Dependencies

```bash
# With mise
mise run setup

# Without mise
pnpm setup
```

This installs all frontend and backend dependencies.

## Running the Application

### With mise (Recommended)

```bash
# Start both apps
mise run dev

# Start individually
mise run dev:web    # Frontend at http://localhost:3000
mise run dev:api    # Backend at http://localhost:8001
```

### Without mise

```bash
# Start both apps
pnpm dev

# Start individually
pnpm dev:web    # Frontend at http://localhost:3000
pnpm dev:api    # Backend at http://localhost:8001
```

### With Docker

```bash
# Start API service
docker-compose up
```

## Project Structure

```
ai-assist/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── layouts/     # Layout components
│   │   │   ├── pages/       # Route pages
│   │   │   └── main.tsx     # App entry point
│   │   └── package.json
│   │
│   └── api/                 # FastAPI backend
│       ├── app/
│       │   ├── routers/     # API routes
│       │   ├── services/    # Business logic
│       │   ├── models/      # Data models
│       │   └── main.py      # FastAPI app
│       └── pyproject.toml
│
├── docs/                    # Documentation
├── .mise.toml              # Tool versions
└── package.json            # Root scripts
```

## Environment Variables

### Setup

```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend
cp apps/api/.env.example apps/api/.env
```

### Key Variables

**Frontend** (`apps/web/.env.local`):

- `VITE_API_URL` - Backend URL (default: <http://localhost:8001>)

**Backend** (`apps/api/.env`):

- `CORS_ORIGINS` - Allowed origins (comma-separated)
- `ENVIRONMENT` - development/staging/production
- `DEBUG` - Enable debug mode

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to ensure consistent and meaningful commit messages. All commits are automatically validated using commitlint.

### Commit Message Format

**Format**: `type(scope?): subject`

**Types allowed**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert a previous commit

**Examples**:
```bash
git commit -m "feat(web): add dark mode toggle"
git commit -m "fix(api): resolve authentication issue"
git commit -m "docs: update README with new setup instructions"
git commit -m "chore(deps): update dependencies"
```

**Breaking Changes**:
For breaking changes, add `BREAKING CHANGE:` in the commit body:
```bash
git commit -m "feat(api): change authentication method" -m "BREAKING CHANGE: JWT tokens now required for all endpoints"
```

### Validation

Commits are automatically validated by husky's commit-msg hook. Invalid commits will be rejected with helpful error messages.

## Common Tasks

### Adding a Frontend Route

1. Create component in `apps/web/src/pages/new-page.tsx`
2. Add to router in `apps/web/src/main.tsx`:

```tsx
import NewPage from './pages/new-page'

// In the router configuration:
{
  path: 'new-route',
  element: <NewPage />
}
```

### Adding an API Endpoint

1. Create router in `apps/api/app/routers/new_router.py`
2. Register in `apps/api/app/main.py`:

```python
from app.routers import new_router

app.include_router(new_router.router, prefix="/api", tags=["new"])
```

### Code Quality

See [Code Quality Guide](./code-quality.md) for formatting and linting.

```bash
# Quick commands
pnpm format     # Format code
pnpm lint       # Check issues
pnpm typecheck  # Type check
pnpm check      # All checks
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port
lsof -i :3000           # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>           # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Dependencies Not Installing

```bash
# Clear caches
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Python Virtual Environment

The backend uses `uv` which manages virtual environments automatically:

- Location: `apps/api/.venv`
- Activation: Not needed - `uv run` handles it
- Manual activation: `source apps/api/.venv/bin/activate`

### Version Mismatches

```bash
# Check installed versions
mise ls                 # If using mise
node --version         # Should be 22.12.x
python --version       # Should be 3.13+
```

**Note**: We only maintain `.mise.toml` for version management. Other version files (`.nvmrc`, `.node-version`, etc.) are not needed since mise handles all tools.

## Additional Resources

- [VACDS Documentation](https://department-of-veterans-affairs.github.io/clinical-design/)
- [React Router v7](https://reactrouter.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Ultracite](https://www.ultracite.ai/)
- [uv](https://github.com/astral-sh/uv)
