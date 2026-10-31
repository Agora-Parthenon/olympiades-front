import Keycloak from 'keycloak-js';
import { getKeycloakUrl } from './config.service';
import { setTokenProvider, setTokenRefresher } from './token-provider.service';
import { useSessionStore } from '../stores/session.store';
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
  setTokenRefresher(renewToken);

  // À assigner AVANT init() : keycloak-js programme l'expiration avec le gestionnaire présent
  // au moment où il reçoit le token. Assigné après, le token obtenu à l'initialisation (connexion
  // ou rechargement de page) n'aurait aucun gestionnaire et ne serait jamais renouvelé tout seul.
  keycloak.onTokenExpired = () => {
    renewToken().catch(() => {
      // Déjà géré dans renewToken (session marquée comme expirée)
    });
  };

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

  return authenticated;
}

/**
 * Renouvelle le token d'accès via le refresh token, sans que l'utilisateur ne s'en aperçoive
 * (US-09, CA-01). Sans effet tant que le token est valable plus de 30 secondes.
 * Si le refresh token n'est plus valable (inactif trop longtemps, session fermée côté
 * Keycloak…), la session est marquée comme expirée (CA-02) et la promesse est rejetée.
 */
async function renewToken(): Promise<void> {
  try {
    await keycloak.updateToken(30);
  } catch (error) {
    keycloak.clearToken();
    useUserStore.getState().clearUser();
    useSessionStore.getState().markExpired();
    throw error;
  }
}

function syncUserStore(): void {
  const parsed = keycloak.tokenParsed;
  if (!parsed?.sub) {
    return;
  }

  useSessionStore.getState().clearExpired();
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
