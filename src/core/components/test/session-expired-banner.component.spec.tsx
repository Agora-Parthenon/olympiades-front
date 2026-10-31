import { fireEvent, render, screen } from '@testing-library/react';
import { login } from '../../services/keycloak.service';
import { useSessionStore } from '../../stores/session.store';
import SessionExpiredBanner from '../session-expired-banner.component';

vi.mock('../../services/keycloak.service', () => ({
  login: vi.fn(),
}));

describe('SessionExpiredBanner', () => {
  beforeEach(() => {
    useSessionStore.setState({ expired: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('n’affiche rien tant que la session est valable', () => {
    render(<SessionExpiredBanner />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prévient l’utilisateur quand la session a expiré (CA-02)', () => {
    useSessionStore.setState({ expired: true });

    render(<SessionExpiredBanner />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Votre session a expiré, veuillez vous reconnecter',
    );
  });

  it('relance le login Keycloak au clic sur "Se connecter" et masque l’alerte', () => {
    useSessionStore.setState({ expired: true });
    render(<SessionExpiredBanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(login).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().expired).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
