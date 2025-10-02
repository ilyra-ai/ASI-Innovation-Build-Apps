#!/usr/bin/env bash
set -euo pipefail
PROFILE="${1:-prod}"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "docker compose command not found" >&2
  exit 127
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "curl command not found" >&2
  exit 127
fi
if [ "$PROFILE" != "dev" ] && [ "$PROFILE" != "prod" ]; then
  echo "unsupported profile: $PROFILE" >&2
  exit 2
fi
STACK=("${COMPOSE[@]}" -f docker-compose.yml)
if [ "$PROFILE" = "prod" ]; then
  STACK+=( -f docker-compose.prod.yml )
fi
cleanup() {
  "${STACK[@]}" down --volumes >/dev/null 2>&1 || true
}
trap cleanup EXIT
"${STACK[@]}" up --build -d
if [ "$PROFILE" = "prod" ]; then
  PORT="${DYAD_PROD_PORT:-8080}"
else
  PORT="${DYAD_WEB_PORT:-5173}"
fi
URL="http://localhost:$PORT"
for _ in $(seq 1 120); do
  if curl -sf "$URL" >/dev/null 2>&1; then
    STATUS=$("${STACK[@]}" ps --status running --services)
    if [ -n "$STATUS" ]; then
      exit 0
    fi
  fi
  sleep 1
  if ! "${STACK[@]}" ps >/dev/null 2>&1; then
    echo "compose process exited unexpectedly" >&2
    exit 1
  fi
  mapfile -t EXITED < <("${STACK[@]}" ps --services --status exited)
  if [ "${#EXITED[@]}" -gt 0 ]; then
    for SERVICE in "${EXITED[@]}"; do
      "${STACK[@]}" logs "$SERVICE"
    done
    echo "service exited with errors" >&2
    exit 1
  fi
done
echo "service did not become healthy within timeout" >&2
exit 1
