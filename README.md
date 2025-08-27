# Welcome to VA AI Assist
This repository contains documentation about a generative AI-enabled chat tool that helps VA clinical staff with summarizing clinical documentation from the electronic health record (EHR) to support pre-encounter chart review.

## Project description
### Overview
VA AI Assist empowers physicians to streamline their workflows by leveraging a Large Language Models (LLM). Our application connects to patient data through a [Model Context Protocol (MCP) server](https://github.com/department-of-veterans-affairs/octo-vista-api-x-mcp-server) that interfaces with VA's VistA EHR system, enabling safe and intelligent summarization and chat-based queries about patient information.
<br>
<br>
VA physicians, nurses, and other clinical staff have expressed interest in using AI to conduct tasks like:
- Summarize large volumes of patient information
- Summarize prior cardiac testing procedures and clinical visits
- Improve accuracy and completeness in coding
- Identify social work service needs through chart review when evaluating a new patient

Learn more about our solution narrative in our [initiative brief](https://github.com/department-of-veterans-affairs/ai-assist/blob/main/docs/initiative-brief.md).

### Timeline

We are currently building a proof of concept through end of September 2025.

Learn more about our phases of work in our [initiative brief](https://github.com/department-of-veterans-affairs/ai-assist/blob/main/docs/initiative-brief.md).

### Roadmap

Our roadmap provides an overview of how we plan to build this generative AI-enabled clinical tool.

![ai-assist-roadmap-august-2025](https://github.com/department-of-veterans-affairs/ai-assist/blob/main/docs/ai-assist-roadmap-august-2025.jpg)

Review our roadmap in [VA Mural](https://app.mural.co/t/departmentofveteransaffairs9999/m/departmentofveteransaffairs9999/1750882921059/550b745268addb245a7f73287ec7645b6fa0d2c7?sender=u65f0a75fc7c68f2a5a2a9545).

## Get to know our code

### Project structure

```
root/
├─ apps/
│  ├─ web/            # React 19 + VACDS
│  └─ api/            # FastAPI service
├─ .mise.toml         # node, python, uv, pnpm versions
├─ pnpm-workspace.yaml
└─ docker-compose.yml # api service
```

### Our tech stack

This is a modern monorepo project with a React 19 frontend using [VA Clinical Design System (VACDS)](./docs/vacds-guide.md)  and FastAPI backend.

#### Frontend

- `React 19` with `React Router v7`
- [VA Clinical Design System (VACDS)](./docs/vacds-guide.md) 
- `TypeScript` with strict mode
- `Ultracite` an AI-ready formatter based on `Biome`
- `Vite` for fast development
- `CSS Modules` for styling
- `Node.js 22.x LTS` or 'Jod'

#### Backend

- `FastAPI` with `Python 3.13`
- `uv` for package management
- `Ruff` for linting/formatting
- `BasedPyright` for type checking

#### Developer tools

- `mise` for version management
- `pnpm` for Node.js packages
- `Docker Compose` for local services

### Installation instructions

Our [quick start guide](./docs/quick-start.md) will help you get up and running. And our [development guide](./docs/development.md) includes comprehensive setup and workflows.

## Connect with us

Reach out on Office of CTO Slack: [#va-ai-chat-public](https://dsva.slack.com/archives/C099YJ3ESJ0)
