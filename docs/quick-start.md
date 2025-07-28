# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js (v22.12.0 LTS recommended)
- Python (v3.13.1+ recommended)
- Git
- GitHub account with personal access token

## 1. Clone & Navigate

```bash
git clone <repository-url>
cd ai-assist
```

## 2. Set up GitHub Authentication

Create `~/.npmrc` file with your GitHub token:

```bash
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

> Need a token? Go to GitHub Settings → Developer settings → Personal access tokens → Classic → Create with `read:packages` scope

## 3. Install & Run

### Option A: With mise (Recommended)

```bash
# One-time setup
curl https://mise.run | sh
mise install

# Install dependencies
mise run setup

# Start development
mise run dev
```

### Option B: Without mise

```bash
# Install tools (if not already installed)
npm install -g pnpm
pip install uv

# Install dependencies
pnpm setup

# Start development
pnpm dev
```

## 4. Access the Apps

- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8001>

## Next Steps

- Check out the [Development Guide](./development.md) for detailed information
- Review [Code Quality](./code-quality.md) for linting and formatting
- See [Common Tasks](./development.md#common-tasks) for adding features

## File Naming Convention

All files in the frontend (`apps/web`) must use kebab-case:

- ✅ `user-profile.tsx`
- ✅ `api-service.ts`
- ✅ `home-page.module.css`
- ❌ `UserProfile.tsx`
- ❌ `apiService.ts`

## Common Commands

```bash
# Development
pnpm dev          # Run both apps
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only

# Code Quality
pnpm format       # Format code
pnpm lint         # Lint code
pnpm typecheck    # Type check
pnpm check        # Run all checks
```

> **Note**: If using mise, you can also use `mise run <command>` for any of these commands.
