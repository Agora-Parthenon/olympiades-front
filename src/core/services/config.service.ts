export interface OlympiadesConfig {
  gatewayUrl: string;
}

declare global {
  interface Window {
    __OLYMPIADES_CONFIG__?: Partial<OlympiadesConfig>;
  }
}

const DEFAULT_GATEWAY_URL = 'http://localhost:8080';

/**
 * URL de la gateway, injectée à l'exécution (public/config.js, templatisé par
 * l'entrypoint Docker via GATEWAY_URL) — jamais figée dans le bundle.
 */
export function getGatewayUrl(): string {
  return window.__OLYMPIADES_CONFIG__?.gatewayUrl ?? DEFAULT_GATEWAY_URL;
}
