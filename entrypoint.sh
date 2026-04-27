#!/bin/sh
set -e

PORT="${PORT:-3000}"

echo "[ruflo] bridging claude-flow stdio MCP to SSE on port ${PORT}"
exec supergateway \
  --stdio "claude-flow mcp start" \
  --port "${PORT}" \
  --baseUrl "http://0.0.0.0:${PORT}" \
  --ssePath /sse \
  --messagePath /message \
  --healthEndpoint /health
