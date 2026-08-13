import { render, screen } from '@testing-library/react';
import { useConnectionStore } from '../../stores/connection.store';
import ConnectionLostBanner from '../connection-lost-banner.component';

describe('ConnectionLostBanner', () => {
  beforeEach(() => {
    useConnectionStore.setState({ isConnected: false, isLost: false });
  });

  it('n’affiche rien tant que la connexion n’est pas signalée comme perdue', () => {
    render(<ConnectionLostBanner />);

    expect(screen.queryByText(/Connexion au serveur perdue/)).not.toBeInTheDocument();
  });

  it('affiche le message exact requis par CA-02 quand isLost devient vrai', () => {
    useConnectionStore.setState({ isLost: true });

    render(<ConnectionLostBanner />);

    expect(
      screen.getByText('Connexion au serveur perdue. Vérifiez votre réseau puis rechargez la page.'),
    ).toBeInTheDocument();
  });

  it('utilise une alerte de sévérité "error" pour attirer l’attention', () => {
    useConnectionStore.setState({ isLost: true });

    render(<ConnectionLostBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
