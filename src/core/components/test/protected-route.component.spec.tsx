import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { login } from '../../services/keycloak.service';
import { useUserStore } from '../../stores/user.store';
import ProtectedRoute from '../protected-route.component';

vi.mock('../../services/keycloak.service', () => ({
  login: vi.fn(),
}));

function renderProtectedRoute() {
  const router = createMemoryRouter(
    [
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
});
