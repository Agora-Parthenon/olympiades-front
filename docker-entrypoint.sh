#!/bin/sh
set -e
if [ -f /usr/share/nginx/html/index.html.template ]; then
  envsubst '$GATEWAY_URL' < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html
fi
exec nginx -g 'daemon off;'
