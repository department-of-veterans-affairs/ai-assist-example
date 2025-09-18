FROM --platform=linux/amd64 ghcr.io/department-of-veterans-affairs/cdsp-base-docker-images/python-base:3.13 AS runtime

# Switch to root to install certificates
USER root

# Create working directory
WORKDIR /app

# Update CA certificates (Alpine-based image uses apk)
RUN apk update && apk add --no-cache ca-certificates libssl3 curl=8.12.0-r0 libcurl-openssl4=8.12.0-r0 \
    && curl -sS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA1-v1.cer -o /usr/local/share/ca-certificates/VA-Internal-S2-RCA1-v1.crt \
    && curl -sS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-RCA2.cer -o /usr/local/share/ca-certificates/VA-Internal-S2-RCA2.crt \
    && curl -sS http://aia.pki.example.com/PKI/AIA/VA/VA-Internal-S2-ICA11.cer -o /usr/local/share/ca-certificates/VA-Internal-S2-ICA11.crt \
    && /usr/sbin/update-ca-certificates --fresh

# Ensure correct ownership of working directory (must be done as root)
RUN chown -R nonroot:nonroot /app

# Switch back to non-root user
USER nonroot

# Install uv for package management
COPY --from=ghcr.io/astral-sh/uv:latest --chown=nonroot:nonroot /uv /usr/local/bin/uv

# Copy dependency files and README (needed for editable install)
COPY --chown=nonroot:nonroot pyproject.toml README.md ./

# Install dependencies in editable mode
RUN uv pip install --system -e .

# Copy application code
COPY --chown=nonroot:nonroot . .

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]