FROM nginx:alpine
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY index.html /usr/share/nginx/html/index.html.template
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
