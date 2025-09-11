---
trigger: always_on
description:
globs:
---

# Code Quality Standards

Always maintain high code quality using the project's established tools and standards.

## Quality Tools

### Frontend (React/TypeScript)
- **Formatter/Linter**: Ultracite (Biome preset) via [apps/web/biome.jsonc](mdc:apps/web/biome.jsonc)
- **Type Checker**: TypeScript
- **File Naming**: kebab-case enforced (e.g., `user-profile.tsx`)

### Backend (Python/FastAPI)  
- **Formatter**: Ruff format
- **Linter**: Ruff check  
- **Type Checker**: BasedPyright
- **Config**: [apps/api/pyproject.toml](mdc:apps/api/pyproject.toml)

## Pre-commit Workflow

Before making changes, run:
```bash
pnpm format  # Format all code
pnpm check   # Lint + type check
pnpm fix     # Auto-fix issues
```

## Code Standards

1. **Simple Solutions**: Prefer simple, non-overcomplicated implementations
2. **Consistent Formatting**: All code must be formatted using project tools
3. **Type Safety**: Full TypeScript and Python type annotations required
4. **File Naming**: Use kebab-case for all files (enforced by linter)
5. **Import Organization**: Use consistent import ordering (handled by formatters)

## Quality Check Commands

- `pnpm format` - Format all code
- `pnpm lint` - Check for issues  
- `pnpm typecheck` - Verify types
- `pnpm check` - Run lint + typecheck
- `pnpm fix` - Format + auto-fix
