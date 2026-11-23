import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStore } from '@/core/stores/user.store';
import { ensureProfile } from '../../services/profile.service';
import ProfileSync from '../profile-sync.component';

vi.mock('../../services/profile.service', () => ({ ensureProfile: vi.fn() }));

function renderSync() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileSync />
    </QueryClientProvider>,
  );
}

describe('ProfileSync', () => {
  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: null });
  });

  it('ne charge rien pour un visiteur', () => {
    useUserStore.setState({ user: null });

    renderSync();

    expect(ensureProfile).not.toHaveBeenCalled();
  });

  it('charge le profil du joueur connecté et reprend son pseudo à la place du nom Keycloak', async () => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'keycloak-name', roles: ['ROLE_USER'] } });
    vi.mocked(ensureProfile).mockResolvedValue({
      id: 'u-1',
      pseudo: 'Pseudo-Profil',
      avatar: null,
      createdAt: '2026-11-01T10:00:00Z',
    });

    renderSync();

    await waitFor(() => expect(useUserStore.getState().user?.pseudo).toBe('Pseudo-Profil'));
    expect(useUserStore.getState().user).toMatchObject({ id: 'u-1', roles: ['ROLE_USER'] });
  });

  it('garde le pseudo Keycloak si le profil n’a pas pu être chargé', async () => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'keycloak-name', roles: [] } });
    vi.mocked(ensureProfile).mockRejectedValue(new Error('down'));

    renderSync();

    await waitFor(() => expect(ensureProfile).toHaveBeenCalled());
    expect(useUserStore.getState().user?.pseudo).toBe('keycloak-name');
  });
});
