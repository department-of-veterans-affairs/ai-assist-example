# Code Quality Guide

This guide covers formatting, linting, and type checking for the AI Assist project.

## Quick Reference

All commands work with both `pnpm` and `mise run`:

| Task | Command | Description |
|------|---------|-------------|
| Format | `pnpm format` | Format all code |
| Lint | `pnpm lint` | Check for code issues |
| Type Check | `pnpm typecheck` | Verify TypeScript/Python types |
| All Checks | `pnpm check` | Run lint + typecheck |
| Auto-fix | `pnpm fix` | Format + fix issues |

## Tools Used

### Frontend (React/TypeScript)

- **Formatter/Linter**: Ultracite (Biome preset)
- **Type Checker**: TypeScript
- **Config**: `apps/web/biome.jsonc`

### Backend (Python/FastAPI)

- **Formatter**: Ruff format
- **Linter**: Ruff check
- **Type Checker**: BasedPyright
- **Config**: `apps/api/pyproject.toml`

## Running Checks

### Check Everything

```bash
# Format all code
pnpm format

# Lint all code
pnpm lint

# Type check all code
pnpm typecheck

# Run all checks at once
pnpm check

# Auto-fix issues
pnpm fix
```

### Check Individual Apps

```bash
# Frontend only
pnpm format:web
pnpm lint:web
pnpm typecheck:web

# Backend only
pnpm format:api
pnpm lint:api
pnpm typecheck:api
```

### Direct Commands

If you need to run tools directly:

```bash
# Frontend
cd apps/web
pnpm format      # or: ultracite format
pnpm lint        # or: ultracite lint
pnpm typecheck   # or: tsc --noEmit

# Backend
cd apps/api
uv run ruff format .
uv run ruff check .
uv run basedpyright
```

## Configuration

### Frontend (Ultracite/Biome)

Located in `apps/web/biome.jsonc`:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.6/schema.json",
  "extends": ["ultracite"],
  "linter": {
    "rules": {
      "style": {
        "useFilenamingConvention": {
          "level": "error",
          "options": {
            "filenameCases": ["kebab-case"]
          }
        }
      }
    }
  }
}
```

**File Naming**: All files must use kebab-case (e.g., `user-profile.tsx`, not `UserProfile.tsx`)

### Backend (Ruff/BasedPyright)

Located in `apps/api/pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py313"
fix = true

[tool.basedpyright]
typeCheckingMode = "strict"
pythonVersion = "3.13"
```

## Pre-commit Workflow

Before committing:

```bash
# 1. Format your code
pnpm format

# 2. Run all checks
pnpm check

# 3. Fix any remaining issues
pnpm fix
```

## VS Code Integration

The project includes VS Code settings for automatic formatting on save:

- Frontend: Uses Biome extension
- Backend: Uses Ruff and BasedPyright extensions

Install recommended extensions when prompted by VS Code.

## Troubleshooting

### "Command not found" errors

Make sure you've run the setup:

```bash
pnpm setup  # or: mise run setup
```

### Type errors after adding dependencies

Update your types:

```bash
# Frontend
cd apps/web && pnpm install

# Backend
cd apps/api && uv pip install -r <(uv pip compile pyproject.toml --extra dev -q)
```

### Conflicting formatters

Make sure you're using the project's formatter, not global ones:

- Disable global Prettier/ESLint extensions
- Use the workspace recommended extensions
