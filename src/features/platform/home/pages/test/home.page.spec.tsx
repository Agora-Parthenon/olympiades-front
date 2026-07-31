import { render, screen } from '@testing-library/react';
import HomePage from '../home.page';

describe('HomePage', () => {
  afterEach(() => {
    delete window.__OLYMPIADES_CONFIG__;
  });

  it('affiche la page d’accueil du socle', () => {
    render(<HomePage />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Olympiades' })).toBeInTheDocument();
  });

  it('pointe le lien de vérification vers la gateway configurée', () => {
    window.__OLYMPIADES_CONFIG__ = { gatewayUrl: 'http://gateway.test:8080' };

    render(<HomePage />);

    expect(screen.getByTestId('home-gateway-health-link')).toHaveAttribute(
      'href',
      'http://gateway.test:8080/health',
    );
  });
});
