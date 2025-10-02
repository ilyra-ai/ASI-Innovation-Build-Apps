#!/bin/bash

PROFILE=${1:-dev}
PORT=${DYAD_WEB_PORT:-5173}

if [ "$PROFILE" = "prod" ]; then
    PORT=${DYAD_PROD_PORT:-8080}
fi

echo "Testing $PROFILE profile on port $PORT..."

# Aguardar servidor iniciar
sleep 10

# Testar disponibilidade
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Smoke test passed! Server is responding on port $PORT"
    exit 0
else
    echo "❌ Smoke test failed! Server returned HTTP $HTTP_CODE"
    exit 1
fi
