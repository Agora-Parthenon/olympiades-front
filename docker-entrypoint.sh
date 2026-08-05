#!/bin/sh
set -e

# Injecte la configuration runtime (GATEWAY_URL) sans rebuild du bundle.
# Sans garde, un GATEWAY_URL absent produirait silencieusement une URL vide.
if [ -z "$GATEWAY_URL" ]; then
  echo "olympiades-front : la variable d'environnement GATEWAY_URL est obligatoire." >&2
  echo "  exemple : docker run -e GATEWAY_URL=http://localhost:8080 olympiades-front" >&2
  exit 1
fi

envsubst '$GATEWAY_URL' < /config.js.template > /usr/share/nginx/html/config.js

exec nginx -g 'daemon off;'
