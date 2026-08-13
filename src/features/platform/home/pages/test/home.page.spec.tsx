import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpClient } from '@/core/services/http-client.service';
import { login } from '@/core/services/keycloak.service';
import HomePage from '../home.page';

vi.mock('@/core/services/http-client.service', () => ({
  httpClient: { get: vi.fn() },
}));

vi.mock('@/core/services/keycloak.service', () => ({
  login: vi.fn(),
}));

// Un QueryClient frais par test : retry désactivé pour ne pas ralentir les tests d'erreur,
// gcTime à 0 pour ne pas faire fuiter du cache d'un test à l'autre.
function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );
}

describe('HomePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la page d’accueil du socle', () => {
    renderHomePage();

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Olympiades' })).toBeInTheDocument();
  });

  it('appelle /health via le client partagé (TanStack Query) au clic sur "Vérifier la gateway"', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { status: 'ok' } });
    renderHomePage();

    fireEvent.click(screen.getByTestId('home-gateway-health-link'));

    expect(httpClient.get).toHaveBeenCalledWith('/health');
    await waitFor(() =>
      expect(screen.getByTestId('home-gateway-health-status')).toHaveTextContent('ok'),
    );
  });

  it('désactive le bouton pendant que la requête est en cours', async () => {
    let resolveHealth: (value: { data: { status: string } }) => void = () => {};
    vi.mocked(httpClient.get).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveHealth = resolve;
      }),
    );
    renderHomePage();

    fireEvent.click(screen.getByTestId('home-gateway-health-link'));

    await waitFor(() => expect(screen.getByTestId('home-gateway-health-link')).toBeDisabled());

    resolveHealth({ data: { status: 'ok' } });
    await waitFor(() => expect(screen.getByTestId('home-gateway-health-link')).toBeEnabled());
  });

  it('affiche un message d’erreur si la gateway est injoignable', async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error('network error'));
    renderHomePage();

    fireEvent.click(screen.getByTestId('home-gateway-health-link'));

    await waitFor(() =>
      expect(screen.getByTestId('home-gateway-health-error')).toBeInTheDocument(),
    );
  });

  it('déclenche le login Keycloak au clic sur "Se connecter"', () => {
    renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(login).toHaveBeenCalled();
  });
});
