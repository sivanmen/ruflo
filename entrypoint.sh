#!/bin/sh
set -e

PORT="${PORT:-3000}"

echo "[ruflo] bridging claude-flow stdio MCP to streamableHttp on port ${PORT} (stateful)"
exec supergateway \
  --stdio "claude-flow mcp start" \
  --outputTransport streamableHttp \
  --stateful \
  --sessionTimeout 1800000 \
  --port "${PORT}" \
  --streamableHttpPath /mcp \
  --healthEndpoint /health
