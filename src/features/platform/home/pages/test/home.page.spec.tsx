import { fireEvent, render, screen } from '@testing-library/react';
import { httpClient } from '@/core/services/http-client.service';
import { login } from '@/core/services/keycloak.service';
import HomePage from '../home.page';

vi.mock('@/core/services/http-client.service', () => ({
  httpClient: { get: vi.fn() },
}));

vi.mock('@/core/services/keycloak.service', () => ({
  login: vi.fn(),
}));

describe('HomePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la page d’accueil du socle', () => {
    render(<HomePage />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Olympiades' })).toBeInTheDocument();
  });

  it('appelle /health via le client partagé au clic sur "Vérifier la gateway"', () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { status: 'ok' } });
    render(<HomePage />);

    fireEvent.click(screen.getByTestId('home-gateway-health-link'));

    expect(httpClient.get).toHaveBeenCalledWith('/health');
  });

  it('déclenche le login Keycloak au clic sur "Se connecter"', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(login).toHaveBeenCalled();
  });
});