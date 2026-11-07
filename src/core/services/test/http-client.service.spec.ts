import type { InternalAxiosRequestConfig } from 'axios';
import { attachAuthHeader } from '../http-client.service';
import { setTokenProvider, setTokenRefresher } from '../token-provider.service';

describe('attachAuthHeader', () => {
  afterEach(() => {
    setTokenProvider(() => undefined);
    setTokenRefresher(() => Promise.resolve());
  });

  it('ajoute l’en-tête Authorization quand un token est disponible', async () => {
    setTokenProvider(() => 'abc123');
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = await attachAuthHeader(config);

    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('n’ajoute rien quand aucun token n’est disponible', async () => {
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = await attachAuthHeader(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('ne tente aucun renouvellement pour un visiteur', async () => {
    const refresher = vi.fn().mockResolvedValue(undefined);
    setTokenRefresher(refresher);

    await attachAuthHeader({ headers: {} } as InternalAxiosRequestConfig);

    expect(refresher).not.toHaveBeenCalled();
  });

  it('renouvelle le token avant la requête et envoie le nouveau (CA-01)', async () => {
    let token = 'ancien-token';
    setTokenProvider(() => token);
    setTokenRefresher(() => {
      token = 'nouveau-token';
      return Promise.resolve();
    });

    const result = await attachAuthHeader({ headers: {} } as InternalAxiosRequestConfig);

    expect(result.headers.Authorization).toBe('Bearer nouveau-token');
  });

  it('n’envoie pas la requête quand la session ne peut plus être renouvelée (CA-02)', async () => {
    setTokenProvider(() => 'ancien-token');
    setTokenRefresher(() => Promise.reject(new Error('session expirée')));

    await expect(attachAuthHeader({ headers: {} } as InternalAxiosRequestConfig)).rejects.toThrow(
      'session expirée',
    );
  });
});
