type TokenProvider = () => string | undefined;
type TokenRefresher = () => Promise<void>;

let tokenProvider: TokenProvider = () => undefined;
let tokenRefresher: TokenRefresher = () => Promise.resolve();

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

export function getToken(): string | undefined {
  return tokenProvider();
}

export function setTokenRefresher(refresher: TokenRefresher): void {
  tokenRefresher = refresher;
}

/**
 * Renouvelle le token s'il est sur le point d'expirer (sans effet s'il est encore valable).
 * À appeler avant une requête ou une connexion : la promesse est rejetée si la session
 * ne peut plus être renouvelée (US-09, CA-01 / CA-02).
 */
export function ensureFreshToken(): Promise<void> {
  return tokenRefresher();
}
