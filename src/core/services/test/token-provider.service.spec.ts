import { getToken, setTokenProvider } from '../token-provider.service';

describe('token-provider', () => {
  afterEach(() => {
    setTokenProvider(() => undefined);
  });

  it('retourne undefined tant qu’aucun provider n’est enregistré', () => {
    expect(getToken()).toBeUndefined();
  });

  it('retourne le token fourni par le provider enregistré', () => {
    setTokenProvider(() => 'xyz789');

    expect(getToken()).toBe('xyz789');
  });
});
