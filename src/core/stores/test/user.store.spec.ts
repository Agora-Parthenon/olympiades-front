import { useUserStore } from '../user.store';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  it('démarre sans utilisateur connecté', () => {
    expect(useUserStore.getState().user).toBeNull();
  });

  it('setUser() expose id, pseudo et rôles (CA-03)', () => {
    useUserStore.getState().setUser({ id: 'u1', pseudo: 'jdupont', roles: ['PLAYER'] });

    expect(useUserStore.getState().user).toEqual({
      id: 'u1',
      pseudo: 'jdupont',
      roles: ['PLAYER'],
    });
  });

  it('setUser() remplace un utilisateur déjà présent', () => {
    useUserStore.getState().setUser({ id: 'u1', pseudo: 'jdupont', roles: [] });
    useUserStore.getState().setUser({ id: 'u2', pseudo: 'mdurand', roles: ['ADMIN'] });

    expect(useUserStore.getState().user).toEqual({ id: 'u2', pseudo: 'mdurand', roles: ['ADMIN'] });
  });

  it('clearUser() réinitialise l’utilisateur à null', () => {
    useUserStore.getState().setUser({ id: 'u1', pseudo: 'jdupont', roles: [] });

    useUserStore.getState().clearUser();

    expect(useUserStore.getState().user).toBeNull();
  });
});
