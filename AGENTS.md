# Repository Guidelines

## Project Structure & Module Organization
- `apps/web/` – Vite + React 19 frontend; components in `src/components`, hooks in `src/hooks`, tests alongside features with `.test.tsx` suffix.
- `apps/api/` – FastAPI service; routers in `app/routers`, services in `app/services`, Pydantic models in `app/models`, pytest suites in `tests/`.
- `docs/` stores architecture briefs and operational runbooks; `scripts/` hosts automation; `config/` keeps environment JSON; `terraform/` contains infrastructure modules.

## Build, Test, and Development Commands
- `mise run dev` – boot frontend and API with hot reload.
- `mise run dev:web` / `mise run dev:api` – start a single app for focused work.
- `mise run build` – compile production bundles (wraps `pnpm build`).
- `mise run test:web` – execute Vitest suites once; add `--watch` locally if desired.
- `mise run test:api` – run pytest with asyncio + coverage plugins.
- `mise run check:web` / `mise run check:api` – lint, type-check, and build gates mirrored in CI.

## Coding Style & Naming Conventions
- TypeScript uses Biome formatting (2-space indent, semicolons off). Components follow PascalCase, hooks use `use` prefix, shared utilities live in `src/lib`.
- Python adheres to Ruff formatting (88-char lines, double quotes) with strict BasedPyright typing; avoid `Any` and prefer TypedDict or Pydantic models.
- Commit to existing folder boundaries—routers call services, services encapsulate integrations, prompts live under versioned `app/prompts/<domain>/` folders.

## Testing Guidelines
- Frontend tests use Vitest + Testing Library; name files `*.test.ts(x)` and mock API calls with MSW fixtures in `src/test`.
- Backend tests use `pytest` and `pytest-asyncio`; mark async cases with `@pytest.mark.asyncio` and keep fixtures in `tests/conftest.py`.
- Aim for >85% coverage on new modules; run `mise run test:api -- --cov=app` or `pnpm test -- --coverage` before merging significant changes.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat(web):`, `fix(api):`, `chore(docs):`). Squash WIP commits before opening a PR.
- PRs must describe the change, list validation steps, link issues, and include screenshots or API trace IDs when altering UI or endpoints.
- Ensure `mise run check:web` and `mise run check:api` pass locally; note any skipped validations in the PR description and justify them.

## Security & Configuration Tips
- Copy `.env.example` files in the root, `apps/web/`, and `apps/api/` before running services; never commit real secrets.
- Azure OpenAI and MCP credentials are managed via environment variables—rotate them through the team vault and document updates in release notes.
