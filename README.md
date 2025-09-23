# AI Clinical Assistant

A modern web application that provides AI-powered clinical assistance for healthcare providers. Built with React, FastAPI, and OpenAI integration.

## Features

- **AI-Powered Chat Interface**: Interactive chat with AI agents for clinical assistance
- **Patient Context Management**: Secure patient data integration with SMART on FHIR
- **Clinical Summaries**: Automated generation of patient summaries and medication insights
- **Modern Tech Stack**: React 19, FastAPI, TypeScript, and comprehensive testing

## Architecture

### Frontend (`apps/web`)
- **React 19** with TypeScript
- **VA Clinical Design System (VACDS)** for UI components
- **React Router v7** for navigation
- **Zustand** for state management
- **TanStack Query** for server state
- **AI SDK** for chat functionality
- **SMART on FHIR** for healthcare authentication

### Backend (`apps/api`)
- **FastAPI** with Python 3.13
- **OpenAI Agents** framework
- **Azure OpenAI** integration
- **Pydantic** for data validation
- **LangSmith** for observability
- **MCP (Model Context Protocol)** for external integrations

## Quick Start

### Prerequisites

- Node.js 22.18.0 LTS
- Python 3.13.1+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-assist
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   pnpm setup
   ```

3. **Configure environment variables**
   ```bash
   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   
   # Backend
   cp apps/api/.env.example apps/api/.env
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   pnpm dev
   
   # Or start individually
   pnpm dev:web    # Frontend at http://localhost:3000
   pnpm dev:api    # Backend at http://localhost:8080
   ```

## Development

### Code Quality

This project enforces high code quality standards:

```bash
# Run all quality checks
pnpm check:all

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

### Testing

```bash
# Run all tests
pnpm test

# Frontend tests only
pnpm test:web

# Backend tests only
pnpm test:api
```

### Project Structure

```
ai-assist/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Route pages
│   │   │   ├── hooks/       # Custom hooks
│   │   │   └── stores/      # Zustand stores
│   │   └── package.json
│   │
│   └── api/                 # FastAPI backend
│       ├── app/
│       │   ├── routers/     # API routes
│       │   ├── services/    # Business logic
│       │   ├── models/      # Data models
│       │   └── agents/      # AI agents
│       └── pyproject.toml
│
├── docs/                    # Documentation
└── package.json            # Root scripts
```

## Configuration

### Environment Variables

**Frontend** (`apps/web/.env.local`):
- `VITE_API_URL` - Backend API URL
- `VITE_SMART_CONTAINER_URL` - SMART on FHIR container URL
- `VITE_AUTH_CLIENT_ID` - OAuth client ID

**Backend** (`apps/api/.env`):
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `CORS_ORIGINS` - Allowed CORS origins
- `ENVIRONMENT` - Environment (development/staging/production)

## API Documentation

When running locally, API documentation is available at:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **OpenAPI Schema**: http://localhost:8080/openapi.json

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `pnpm check:all`
5. Write tests for new functionality
6. Submit a pull request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(web): add dark mode toggle
fix(api): resolve authentication issue
docs: update README with setup instructions
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please open an issue in the repository.