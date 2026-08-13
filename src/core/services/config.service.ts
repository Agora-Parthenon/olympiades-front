export interface OlympiadesConfig {
  gatewayUrl: string;
  keycloakUrl: string;
}

declare global {
  interface Window {
    __OLYMPIADES_CONFIG__?: Partial<OlympiadesConfig>;
  }
}

const DEFAULT_GATEWAY_URL = 'http://localhost:8080';
const DEFAULT_KEYCLOAK_URL = 'http://localhost:8180';

/**
 * URL de la gateway, injectée à l'exécution (public/config.js, templatisé par
 * l'entrypoint Docker via GATEWAY_URL) — jamais figée dans le bundle.
 */
export function getGatewayUrl(): string {
  return window.__OLYMPIADES_CONFIG__?.gatewayUrl ?? DEFAULT_GATEWAY_URL;
}

export function getKeycloakUrl(): string {
  return window.__OLYMPIADES_CONFIG__?.keycloakUrl ?? DEFAULT_KEYCLOAK_URL;
}