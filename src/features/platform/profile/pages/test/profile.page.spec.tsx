import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useUserStore } from '@/core/stores/user.store';
import { ensureProfile, getAvatars, updateProfile } from '../../services/profile.service';
import ProfilePage from '../profile.page';

vi.mock('../../services/profile.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/profile.service')>()),
  ensureProfile: vi.fn(),
  updateProfile: vi.fn(),
  getAvatars: vi.fn(),
}));

const profile = { id: 'u-1', pseudo: 'Lucy', avatar: null, createdAt: '2026-11-01T10:00:00Z' };

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>,
  );
}

function apiError(code: string, status: number) {
  const error = new AxiosError('request failed');
  error.response = { status, data: { error: code } } as AxiosError['response'];
  return error;
}

const RULE = /de 3 à 20 lettres, chiffres ou tirets/;

describe('ProfilePage', () => {
  beforeEach(() => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });
    vi.mocked(ensureProfile).mockResolvedValue(profile);
    vi.mocked(getAvatars).mockResolvedValue(['fox', 'owl']);
  });

  afterEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: null });
  });

  describe('consultation (CA-01)', () => {
    it('affiche le pseudo, l’avatar et la date d’inscription', async () => {
      vi.mocked(ensureProfile).mockResolvedValue({ ...profile, avatar: 'fox' });

      renderPage();

      expect(await screen.findByTestId('profile-pseudo')).toHaveTextContent('Lucy');
      expect(screen.getByRole('heading', { name: 'Mon profil' })).toBeInTheDocument();
      expect(screen.getByTestId('profile-created-at')).toHaveTextContent(
        'Inscrit le 1 novembre 2026',
      );
      expect(screen.getAllByText('🦊').length).toBeGreaterThan(0);
    });

    it('signale un profil impossible à charger', async () => {
      vi.mocked(ensureProfile).mockRejectedValue(new Error('down'));

      renderPage();

      expect(await screen.findByText('Impossible de charger votre profil.')).toBeInTheDocument();
    });
  });

  describe('modification', () => {
    async function openForm() {
      renderPage();
      return screen.findByLabelText(/Pseudo/);
    }

    it('enregistre un nouveau pseudo valide et confirme (CA-02)', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, pseudo: 'Lucy-2' });
      const field = await openForm();

      fireEvent.change(field, { target: { value: 'Lucy-2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

      expect(await screen.findByText('Profil mis à jour')).toBeInTheDocument();
      expect(updateProfile).toHaveBeenCalledWith({ pseudo: 'Lucy-2', avatar: null });
      expect(await screen.findByTestId('profile-pseudo')).toHaveTextContent('Lucy-2');
    });

    it('enregistre l’avatar choisi', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, avatar: 'owl' });
      await openForm();

      fireEvent.click(await screen.findByRole('button', { name: 'owl' }));
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

      await waitFor(() =>
        expect(updateProfile).toHaveBeenCalledWith({ pseudo: 'Lucy', avatar: 'owl' }),
      );
    });

    it('affiche « Ce pseudo est déjà utilisé » et ne touche pas au profil affiché (CA-03)', async () => {
      vi.mocked(updateProfile).mockRejectedValue(apiError('pseudo_taken', 409));
      const field = await openForm();

      fireEvent.change(field, { target: { value: 'Pris' } });
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

      expect(await screen.findByText('Ce pseudo est déjà utilisé')).toBeInTheDocument();
      expect(screen.getByTestId('profile-pseudo')).toHaveTextContent('Lucy');
    });

    it('explique la règle quand le serveur refuse le pseudo', async () => {
      vi.mocked(updateProfile).mockRejectedValue(apiError('invalid_pseudo', 400));
      const field = await openForm();

      fireEvent.change(field, { target: { value: 'Valide' } });
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(RULE);
    });

    it('affiche un message générique sur toute autre erreur', async () => {
      vi.mocked(updateProfile).mockRejectedValue(new Error('network'));
      const field = await openForm();

      fireEvent.change(field, { target: { value: 'Valide' } });
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

      expect(await screen.findByText(/Impossible d’enregistrer le profil/)).toBeInTheDocument();
    });

    it('n’envoie rien tant que rien n’a changé', async () => {
      await openForm();

      expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    });

    it.each(['ab', 'avec espace', 'accentué'])(
      'refuse « %s » avant même d’appeler le serveur',
      async (value) => {
        const field = await openForm();

        fireEvent.change(field, { target: { value } });

        expect(screen.getByText(RULE)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
        expect(updateProfile).not.toHaveBeenCalled();
      },
    );

    it('efface le message de confirmation dès que l’on modifie à nouveau le formulaire', async () => {
      vi.mocked(updateProfile).mockResolvedValue({ ...profile, pseudo: 'Lucy-2' });
      const field = await openForm();
      fireEvent.change(field, { target: { value: 'Lucy-2' } });
      fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
      await screen.findByText('Profil mis à jour');

      fireEvent.change(field, { target: { value: 'Lucy-3' } });

      expect(screen.queryByText('Profil mis à jour')).not.toBeInTheDocument();
    });
  });
});
