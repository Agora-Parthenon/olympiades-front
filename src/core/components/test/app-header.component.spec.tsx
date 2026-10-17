import { fireEvent, render, screen } from '@testing-library/react';
import { login, logout } from '../../services/keycloak.service';
import { useUserStore } from '../../stores/user.store';
import AppHeader from '../app-header.component';

vi.mock('../../services/keycloak.service', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

describe('AppHeader', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('visiteur non connecté', () => {
    it('propose "Se connecter" et n’affiche aucun pseudo', () => {
      render(<AppHeader />);

      expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
      expect(screen.queryByTestId('header-pseudo')).not.toBeInTheDocument();
    });

    it('déclenche le login Keycloak au clic sur "Se connecter"', () => {
      render(<AppHeader />);

      fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

      expect(login).toHaveBeenCalledTimes(1);
    });
  });

  describe('utilisateur connecté', () => {
    beforeEach(() => {
      useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });
    });

    it('affiche le pseudo dans l’en-tête', () => {
      render(<AppHeader />);

      expect(screen.getByTestId('header-pseudo')).toHaveTextContent('Lucy');
    });

    it('remplace "Se connecter" par "Se déconnecter"', () => {
      render(<AppHeader />);

      expect(screen.queryByRole('button', { name: 'Se connecter' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Se déconnecter' })).toBeInTheDocument();
    });

    it('déclenche la déconnexion au clic sur "Se déconnecter"', () => {
      render(<AppHeader />);

      fireEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));

      expect(logout).toHaveBeenCalledTimes(1);
    });
  });
});
