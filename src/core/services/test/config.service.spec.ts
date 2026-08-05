import { getGatewayUrl } from '../config.service';

describe('getGatewayUrl', () => {
  afterEach(() => {
    delete window.__OLYMPIADES_CONFIG__;
  });

  it('retourne l’URL injectée à l’exécution quand elle est présente', () => {
    window.__OLYMPIADES_CONFIG__ = { gatewayUrl: 'https://olympiades.example.com' };

    expect(getGatewayUrl()).toBe('https://olympiades.example.com');
  });

  it('retombe sur l’URL de dev locale quand rien n’est injecté', () => {
    expect(getGatewayUrl()).toBe('http://localhost:8080');
  });

  it('retombe sur l’URL de dev locale quand la config injectée est incomplète', () => {
    window.__OLYMPIADES_CONFIG__ = {};

    expect(getGatewayUrl()).toBe('http://localhost:8080');
  });
});
