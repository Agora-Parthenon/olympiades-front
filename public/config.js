// Configuration runtime injectée par l'environnement (voir config.js.template pour Docker).
// En dev local, la gateway tourne sur le port 8080 (make up dans olympiades-infra).
window.__OLYMPIADES_CONFIG__ = {
  gatewayUrl: 'http://localhost:8080',
  keycloakUrl: 'http://localhost:8081',
};
