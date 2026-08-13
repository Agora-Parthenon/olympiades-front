import Keycloak from 'keycloak-js';
import { getKeycloakUrl } from './config.service';
import { setTokenProvider } from './token-provider.service';
import { useUserStore } from '../stores/user.store';

const keycloak = new Keycloak({
  url: getKeycloakUrl(),
  realm: 'olympiades',
  clientId: 'olympiades-front',
});

/**
 * À appeler une seule fois, avant le premier render (voir main.tsx).
 * Flux Authorization Code + PKCE (DAT §3.5) : onLoad 'check-sso' ne force pas
 * le login, il détecte juste une session Keycloak existante sans redirection visible.
 */
export async function initKeycloak(): Promise<boolean> {
  setTokenProvider(() => keycloak.token);

  const authenticated = await keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
  });

  if (authenticated) {
    syncUserStore();
  }

  keycloak.onAuthSuccess = syncUserStore;
  keycloak.onAuthLogout = () => useUserStore.getState().clearUser();
  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).catch(() => keycloak.logout());
  };

  return authenticated;
}

function syncUserStore(): void {
  const parsed = keycloak.tokenParsed;
  if (!parsed?.sub) {
    return;
  }

  useUserStore.getState().setUser({
    id: parsed.sub,
    pseudo: typeof parsed.preferred_username === 'string' ? parsed.preferred_username : '',
    roles: parsed.realm_access?.roles ?? [],
  });
}

export function login(redirectUri?: string): Promise<void> {
  return keycloak.login(redirectUri ? { redirectUri } : undefined);
}

export function logout(): Promise<void> {
  useUserStore.getState().clearUser();
  return keycloak.logout({ redirectUri: window.location.origin });
}

export function isAuthenticated(): boolean {
  return keycloak.authenticated ?? false;
}

export default keycloak;
