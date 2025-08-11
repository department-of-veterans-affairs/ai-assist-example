# LangSmith Tracing for AI Assist

This document describes how to configure and use LangSmith tracing for monitoring and debugging the OpenAI Agents SDK implementation in AI Assist.

## Overview

LangSmith provides observability into agent execution, allowing you to:
- Track agent decisions and tool calls
- Monitor performance and latency
- Debug complex agent workflows
- Analyze patient query patterns
- Optimize agent prompts and behavior

## Configuration

### 1. Set Environment Variables

Add the following to your `.env` file in `apps/api/`:

```bash
# LangSmith Configuration
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your-langsmith-api-key
LANGSMITH_PROJECT="ai-assist-local"  # Change for different environments

# IMPORTANT: Remove or comment out this line if it exists:
# OPENAI_AGENTS_DISABLE_TRACING=1
```

**⚠️ Important**: The `OPENAI_AGENTS_DISABLE_TRACING` environment variable must NOT be set to `1` as it will completely disable all tracing, including LangSmith. Either remove this line from your `.env` file or set it to `0`.

### 2. Obtain a LangSmith API Key

1. Sign up at [smith.langchain.com](https://smith.langchain.com)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy the key to your `.env` file

### 3. Project Organization

Projects in LangSmith help organize traces:
- Use `ai-assist-local` for local development
- Use `ai-assist-staging` for staging environment
- Use `ai-assist-production` for production

## How It Works

### Automatic Integration

The tracing is automatically initialized when the FastAPI application starts:

1. **Startup**: The `initialize_langsmith_tracing()` function is called in `app/main.py`
2. **Configuration**: If enabled, it configures the OpenAI Agents SDK tracing processor
3. **Runtime**: All agent runs are automatically traced without code changes

### What Gets Traced

- **Agent Execution**: Each agent run with input/output
- **Tool Calls**: All Vista MCP tool invocations
- **Token Usage**: Model token consumption
- **Latency**: Time taken for each step
- **Metadata**: Patient DFN and workflow context

### Trace Structure

Each trace includes:
```
Vista Patient Query
├── Agent: Vista Clinical Assistant
├── Input: Patient query with DFN
├── Tool Calls:
│   ├── get_patient_vitals
│   ├── get_patient_labs
│   └── (other MCP tools)
└── Output: Formatted response
```

## Viewing Traces

### LangSmith Dashboard

1. Go to [smith.langchain.com](https://smith.langchain.com)
2. Select your project (e.g., `ai-assist-local`)
3. View recent traces in the Runs tab
4. Click on any run to see detailed execution

### Key Metrics to Monitor

- **Latency**: Total time from query to response
- **Token Usage**: Input/output tokens per query
- **Tool Call Frequency**: Which Vista tools are used most
- **Error Rate**: Failed queries or tool calls
- **Patient Context**: DFN-based query patterns

## Best Practices

### Development

- Enable tracing in development to understand agent behavior
- Use descriptive project names for different environments
- Review traces to optimize prompts and tool usage

### Production

- Consider data privacy - patient data may be included in traces
- Set appropriate retention policies in LangSmith
- Monitor costs associated with tracing volume
- Use sampling for high-traffic environments

### Security

- **Never commit API keys**: Keep them in `.env` files
- **Rotate keys regularly**: Especially for production
- **Limit access**: Use project-based permissions in LangSmith
- **PHI Considerations**: Be aware that patient data may be traced

### Input/Output Data in Traces

To see input and output data in your LangSmith traces, configure the `TRACE_INCLUDE_SENSITIVE_DATA` environment variable:

```bash
# In your .env file
TRACE_INCLUDE_SENSITIVE_DATA=true  # For development/debugging
# or
TRACE_INCLUDE_SENSITIVE_DATA=false  # For production with PHI
```

This setting controls whether input/output data is included in traces:
- `true`: Full input/output data visible in LangSmith (use for development)
- `false`: No sensitive data in traces (use for production with PHI)

**⚠️ Important for Production**: Always set `TRACE_INCLUDE_SENSITIVE_DATA=false` when handling PHI or other sensitive patient data to prevent it from being sent to LangSmith.

## Troubleshooting

### Tracing Not Working

1. **Check environment variables**:
   ```bash
   cd apps/api
   grep LANGSMITH .env
   ```

2. **Verify API key is valid**:
   - Test key at smith.langchain.com
   - Check for typos or extra spaces

3. **Check logs**:
   ```bash
   pnpm dev:api
   # Look for: "LangSmith tracing initialized for project: ..."
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| No traces appearing | Verify LANGSMITH_TRACING=true |
| Authentication error | Check API key is correct |
| Wrong project | Update LANGSMITH_PROJECT value |
| Missing dependencies | Run `uv sync` to install langsmith |

## Disabling Tracing

To disable tracing:

1. **Temporarily**: Set `LANGSMITH_TRACING=false` in `.env`
2. **Permanently**: Remove LangSmith configuration from `.env`

## Advanced Configuration

### Custom Metadata

The chat service adds metadata to traces:

```python
run_config = RunConfig(
    workflow_name="vista_patient_query",
    trace_metadata={"patient_dfn": patient_dfn}
)
```

### Filtering Sensitive Data

By default, sensitive data is excluded from traces:

```python
trace_include_sensitive_data=False  # Don't include PHI in traces
```

## Integration Points

### Files Modified

1. **pyproject.toml**: Added `langsmith[openai-agents]` dependency
2. **app/config.py**: Added LangSmith configuration fields
3. **app/services/tracing.py**: Tracing initialization module
4. **app/main.py**: Startup integration
5. **.env.example**: Template for LangSmith variables

### Agent Integration

The tracing automatically captures:
- Orchestrator agent decisions
- Vista MCP tool calls
- Azure OpenAI interactions
- Error handling and retries

## Costs and Limits

- **Free Tier**: Limited traces per month
- **Paid Plans**: Based on trace volume
- **Retention**: Default 90 days (configurable)
- **Rate Limits**: Check LangSmith documentation

## Further Resources

- [LangSmith Documentation](https://docs.smith.langchain.com)
- [OpenAI Agents SDK Tracing Guide](https://docs.smith.langchain.com/observability/how_to_guides/trace_with_openai_agents_sdk)
- [LangSmith API Reference](https://api.smith.langchain.com/docs)