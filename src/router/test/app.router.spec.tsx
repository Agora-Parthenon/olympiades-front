import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { login } from '@/core/services/keycloak.service';
import { useSessionStore } from '@/core/stores/session.store';
import { useUserStore } from '@/core/stores/user.store';
import { routes } from '../app.router';

vi.mock('@/core/services/keycloak.service', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe('routes', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
    useSessionStore.setState({ expired: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passe de l’accueil au catalogue depuis le menu, sans recharger la page (CA-01)', () => {
    const router = renderAt('/');
    const navigations: string[] = [];
    router.subscribe((state) => navigations.push(state.location.pathname));

    fireEvent.click(screen.getByRole('link', { name: 'Catalogue' }));

    expect(screen.getByTestId('catalog-page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/catalogue');
    expect(navigations).toContain('/catalogue');
  });

  it('laisse un visiteur sur les pages publiques', () => {
    renderAt('/catalogue');

    expect(screen.getByTestId('catalog-page')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it.each(['/profil', '/lobby'])(
    'renvoie un visiteur non connecté de %s vers la connexion (CA-02)',
    (path) => {
      renderAt(path);

      expect(login).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('lobby-page')).not.toBeInTheDocument();
    },
  );

  it('affiche le lobby à un utilisateur connecté', () => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });

    renderAt('/lobby');

    expect(screen.getByTestId('lobby-page')).toBeInTheDocument();
  });

  it('affiche une page 404 pour une URL inconnue, avec un lien de retour à l’accueil (CA-03)', () => {
    const router = renderAt('/n-importe-quoi');

    expect(screen.getByTestId('not-found-page')).toHaveTextContent('Cette page n’existe pas');

    act(() => {
      fireEvent.click(screen.getByRole('link', { name: 'Retour à l’accueil' }));
    });

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
