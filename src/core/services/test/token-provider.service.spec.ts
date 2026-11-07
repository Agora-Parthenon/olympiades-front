import {
  ensureFreshToken,
  getToken,
  setTokenProvider,
  setTokenRefresher,
} from '../token-provider.service';

describe('token-provider', () => {
  afterEach(() => {
    setTokenProvider(() => undefined);
    setTokenRefresher(() => Promise.resolve());
  });

  it('retourne undefined tant qu’aucun provider n’est enregistré', () => {
    expect(getToken()).toBeUndefined();
  });

  it('retourne le token fourni par le provider enregistré', () => {
    setTokenProvider(() => 'xyz789');

    expect(getToken()).toBe('xyz789');
  });

  describe('ensureFreshToken', () => {
    it('ne fait rien tant qu’aucun renouvellement n’est enregistré', async () => {
      await expect(ensureFreshToken()).resolves.toBeUndefined();
    });

    it('délègue au renouvellement enregistré', async () => {
      const refresher = vi.fn().mockResolvedValue(undefined);
      setTokenRefresher(refresher);

      await ensureFreshToken();

      expect(refresher).toHaveBeenCalledTimes(1);
    });

    it('rejette quand le renouvellement échoue', async () => {
      setTokenRefresher(() => Promise.reject(new Error('session expirée')));

      await expect(ensureFreshToken()).rejects.toThrow('session expirée');
    });
  });
});
