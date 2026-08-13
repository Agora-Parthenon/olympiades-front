import type { FC, PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpClient } from '@/core/services/http-client.service';
import { useGatewayHealth } from '../use-gateway-health.hook';

vi.mock('@/core/services/http-client.service', () => ({
  httpClient: { get: vi.fn() },
}));

function createWrapper(): FC<PropsWithChildren> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useGatewayHealth', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('ne déclenche aucun appel au montage (enabled: false, déclenchement manuel)', () => {
    renderHook(() => useGatewayHealth(), { wrapper: createWrapper() });

    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it('appelle GET /health via le client partagé au refetch()', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { status: 'ok' } });
    const { result } = renderHook(() => useGatewayHealth(), { wrapper: createWrapper() });

    result.current.refetch();

    await waitFor(() => expect(result.current.data).toEqual({ status: 'ok' }));
    expect(httpClient.get).toHaveBeenCalledWith('/health');
  });

  it('expose l’erreur si l’appel échoue', async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error('gateway down'));
    const { result } = renderHook(() => useGatewayHealth(), { wrapper: createWrapper() });

    result.current.refetch();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
