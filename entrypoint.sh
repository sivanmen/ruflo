#!/bin/sh
set -e

PORT="${PORT:-3000}"

echo "[ruflo] starting MCP server on port ${PORT} (transport=http)"
exec ruflo mcp start -t http -p "${PORT}"
