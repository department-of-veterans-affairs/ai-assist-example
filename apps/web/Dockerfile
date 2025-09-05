# Layer 1: node
# Match to .node-version file  
FROM node:22.18.0 AS builder

WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH

# Copy monorepo package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Enable corepack for pnpm
RUN corepack enable

# Configure GitHub npm registry with secret
RUN --mount=type=secret,id=GITHUB_PACKAGE_TOKEN \
    echo "@department-of-veterans-affairs:registry=https://npm.pkg.github.com" >> .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/GITHUB_PACKAGE_TOKEN)" >> .npmrc

# Install dependencies with increased timeout
RUN pnpm install --frozen-lockfile --network-timeout 150000

# Copy source code
COPY apps/web ./apps/web
COPY biome.json tsconfig.json ./

# Build the web application
WORKDIR /app/apps/web
RUN pnpm build

# Layer 2: nginx
FROM ghcr.io/department-of-veterans-affairs/smart-on-fhir-infra/cdsp-base-nginx:latest
USER nginx

# Copy built application to nginx html directory
COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html

# Copy nginx configuration if it exists
COPY apps/web/default.conf /etc/nginx/conf.d/default.conf

# For Trivy security scanning - bring package files so Trivy can detect runtime libraries
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/web/package.json ./apps/web/