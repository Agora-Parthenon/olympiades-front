import type { InternalAxiosRequestConfig } from 'axios';
import { attachAuthHeader } from '../http-client.service';
import { setTokenProvider } from '../token-provider.service';

describe('attachAuthHeader', () => {
  afterEach(() => {
    setTokenProvider(() => undefined);
  });

  it('ajoute l’en-tête Authorization quand un token est disponible', () => {
    setTokenProvider(() => 'abc123');
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = attachAuthHeader(config);

    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('n’ajoute rien quand aucun token n’est disponible', () => {
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const result = attachAuthHeader(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
