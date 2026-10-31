import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { login } from '../../services/keycloak.service';
import { useSessionStore } from '../../stores/session.store';
import { useUserStore } from '../../stores/user.store';
import ProtectedRoute from '../protected-route.component';

vi.mock('../../services/keycloak.service', () => ({
  login: vi.fn(),
}));

function renderProtectedRoute() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p data-testid="home">Accueil</p> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/profil', element: <p data-testid="secret">Page protégée</p> }],
      },
    ],
    { initialEntries: ['/profil'] },
  );

  return render(<RouterProvider router={router} />);
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
    useSessionStore.setState({ expired: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirige un visiteur vers le login Keycloak, en demandant de revenir sur la page demandée', () => {
    renderProtectedRoute();

    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(window.location.href);
  });

  it('n’affiche pas la page protégée à un visiteur', () => {
    renderProtectedRoute();

    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  it('affiche la page protégée à un utilisateur connecté, sans relancer le login', () => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });

    renderProtectedRoute();

    expect(screen.getByTestId('secret')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('ramène sur l’accueil, sans relancer le login, quand la session vient d’expirer (US-09, CA-02)', () => {
    useSessionStore.setState({ expired: true });

    renderProtectedRoute();

    expect(screen.getByTestId('home')).toBeInTheDocument();
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('ne renvoie pas vers Keycloak un utilisateur qui perd sa session sur la page, même avant que l’expiration soit marquée', () => {
    // keycloak-js vide l'utilisateur (onAuthLogout) un instant AVANT que le service marque la
    // session comme expirée : à cet instant précis le drapeau est encore à false.
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });
    renderProtectedRoute();
    expect(screen.getByTestId('secret')).toBeInTheDocument();

    act(() => {
      useUserStore.setState({ user: null });
    });

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });
});
