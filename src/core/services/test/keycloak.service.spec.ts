import { useUserStore } from '../../stores/user.store';
import { getToken, setTokenProvider } from '../token-provider.service';

// keycloak.service.ts instancie `new Keycloak(...)` au chargement du module (singleton).
// On mocke keycloak-js pour que ce singleton soit un objet contrôlable depuis les tests :
// vi.hoisted() est nécessaire car vi.mock() est hoisté au-dessus des imports par Vitest.
const { keycloakInstance } = vi.hoisted(() => ({
  keycloakInstance: {
    init: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    updateToken: vi.fn(),
    token: undefined as string | undefined,
    tokenParsed: undefined as
      { sub?: string; preferred_username?: string; realm_access?: { roles: string[] } } | undefined,
    authenticated: false as boolean | undefined,
    onAuthSuccess: undefined as (() => void) | undefined,
    onAuthLogout: undefined as (() => void) | undefined,
    onTokenExpired: undefined as (() => void) | undefined,
  },
}));

vi.mock('keycloak-js', () => ({
  // Fonction classique (pas une arrow function) : indispensable pour qu'un mock Vitest
  // reste utilisable avec `new` — les arrow functions ne sont pas des constructeurs valides.
  default: vi.fn().mockImplementation(function () {
    return keycloakInstance;
  }),
}));

import { initKeycloak, isAuthenticated, login, logout } from '../keycloak.service';

describe('keycloak.service', () => {
  beforeEach(() => {
    keycloakInstance.init.mockReset();
    keycloakInstance.login.mockReset();
    keycloakInstance.logout.mockReset();
    keycloakInstance.updateToken.mockReset();
    keycloakInstance.token = undefined;
    keycloakInstance.tokenParsed = undefined;
    keycloakInstance.authenticated = false;
    keycloakInstance.onAuthSuccess = undefined;
    keycloakInstance.onAuthLogout = undefined;
    keycloakInstance.onTokenExpired = undefined;
    useUserStore.setState({ user: null });
    setTokenProvider(() => undefined);
  });

  describe('initKeycloak', () => {
    it('initialise Keycloak avec le flux Authorization Code + PKCE et un check-sso silencieux', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);

      await initKeycloak();

      expect(keycloakInstance.init).toHaveBeenCalledWith({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      });
    });

    it('renvoie true et synchronise le store utilisateur quand une session existe déjà', async () => {
      keycloakInstance.tokenParsed = {
        sub: 'user-1',
        preferred_username: 'jdupont',
        realm_access: { roles: ['PLAYER', 'ADMIN'] },
      };
      keycloakInstance.init.mockResolvedValueOnce(true);

      const authenticated = await initKeycloak();

      expect(authenticated).toBe(true);
      expect(useUserStore.getState().user).toEqual({
        id: 'user-1',
        pseudo: 'jdupont',
        roles: ['PLAYER', 'ADMIN'],
      });
    });

    it('renvoie false et laisse le store utilisateur vide quand aucune session n’existe', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);

      const authenticated = await initKeycloak();

      expect(authenticated).toBe(false);
      expect(useUserStore.getState().user).toBeNull();
    });

    it('gère un pseudo/rôles absents sans planter (valeurs par défaut)', async () => {
      keycloakInstance.tokenParsed = { sub: 'user-2' };
      keycloakInstance.init.mockResolvedValueOnce(true);

      await initKeycloak();

      expect(useUserStore.getState().user).toEqual({ id: 'user-2', pseudo: '', roles: [] });
    });

    it('branche le token-provider partagé (CA-01) sur le token Keycloak courant', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);
      keycloakInstance.token = 'live-token';

      await initKeycloak();

      expect(getToken()).toBe('live-token');
    });

    it('resynchronise le store utilisateur quand Keycloak déclenche onAuthSuccess plus tard', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);
      await initKeycloak();

      keycloakInstance.tokenParsed = {
        sub: 'user-3',
        preferred_username: 'mdurand',
        realm_access: { roles: [] },
      };
      keycloakInstance.onAuthSuccess?.();

      expect(useUserStore.getState().user).toEqual({ id: 'user-3', pseudo: 'mdurand', roles: [] });
    });

    it('vide le store utilisateur quand Keycloak déclenche onAuthLogout', async () => {
      useUserStore.setState({ user: { id: 'x', pseudo: 'x', roles: [] } });
      keycloakInstance.init.mockResolvedValueOnce(false);
      await initKeycloak();

      keycloakInstance.onAuthLogout?.();

      expect(useUserStore.getState().user).toBeNull();
    });

    it('tente un refresh silencieux à l’expiration du token, et logout si ça échoue', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);
      keycloakInstance.updateToken.mockRejectedValueOnce(new Error('expired'));
      await initKeycloak();

      keycloakInstance.onTokenExpired?.();

      expect(keycloakInstance.updateToken).toHaveBeenCalledWith(30);
      await vi.waitFor(() => expect(keycloakInstance.logout).toHaveBeenCalled());
    });

    it('ne déconnecte pas l’utilisateur si le refresh silencieux réussit', async () => {
      keycloakInstance.init.mockResolvedValueOnce(false);
      keycloakInstance.updateToken.mockResolvedValueOnce(true);
      await initKeycloak();

      keycloakInstance.onTokenExpired?.();
      await vi.waitFor(() => expect(keycloakInstance.updateToken).toHaveBeenCalledWith(30));

      expect(keycloakInstance.logout).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('délègue à Keycloak avec le redirectUri fourni', async () => {
      await login('https://app.example.com/callback');

      expect(keycloakInstance.login).toHaveBeenCalledWith({
        redirectUri: 'https://app.example.com/callback',
      });
    });

    it('délègue à Keycloak sans option quand aucun redirectUri n’est fourni', async () => {
      await login();

      expect(keycloakInstance.login).toHaveBeenCalledWith(undefined);
    });
  });

  describe('logout', () => {
    it('vide le store utilisateur et redirige vers l’origine de l’application', async () => {
      useUserStore.setState({ user: { id: 'x', pseudo: 'x', roles: [] } });

      await logout();

      expect(useUserStore.getState().user).toBeNull();
      expect(keycloakInstance.logout).toHaveBeenCalledWith({ redirectUri: window.location.origin });
    });
  });

  describe('isAuthenticated', () => {
    it('reflète l’état interne de Keycloak', () => {
      keycloakInstance.authenticated = true;
      expect(isAuthenticated()).toBe(true);

      keycloakInstance.authenticated = undefined;
      expect(isAuthenticated()).toBe(false);
    });
  });
});
