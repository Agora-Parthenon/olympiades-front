import { useSessionStore } from '../session.store';

describe('session.store', () => {
  beforeEach(() => {
    useSessionStore.setState({ expired: false });
  });

  it('n’est pas expirée au départ', () => {
    expect(useSessionStore.getState().expired).toBe(false);
  });

  it('se marque comme expirée', () => {
    useSessionStore.getState().markExpired();

    expect(useSessionStore.getState().expired).toBe(true);
  });

  it('efface la marque d’expiration', () => {
    useSessionStore.setState({ expired: true });

    useSessionStore.getState().clearExpired();

    expect(useSessionStore.getState().expired).toBe(false);
  });
});
