import { AxiosError } from 'axios';
import { httpClient } from '@/core/services/http-client.service';
import {
  ensureProfile,
  getAvatars,
  PSEUDO_PATTERN,
  profileErrorCode,
  updateProfile,
} from '../profile.service';

vi.mock('@/core/services/http-client.service', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const profile = { id: 'u-1', pseudo: 'Lucy', avatar: null, createdAt: '2026-11-01T10:00:00Z' };

describe('profile.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('crée ou récupère le profil par POST /api/platform/profiles/me', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: profile });

    await expect(ensureProfile()).resolves.toEqual(profile);
    expect(httpClient.post).toHaveBeenCalledWith('/api/platform/profiles/me');
  });

  it('modifie le profil par PUT /api/platform/profiles/me', async () => {
    const update = { pseudo: 'Lucy2', avatar: 'fox' };
    vi.mocked(httpClient.put).mockResolvedValueOnce({ data: { ...profile, ...update } });

    await expect(updateProfile(update)).resolves.toMatchObject(update);
    expect(httpClient.put).toHaveBeenCalledWith('/api/platform/profiles/me', update);
  });

  it('récupère la liste des avatars', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: ['fox', 'owl'] });

    await expect(getAvatars()).resolves.toEqual(['fox', 'owl']);
    expect(httpClient.get).toHaveBeenCalledWith('/api/platform/profiles/avatars');
  });

  describe('profileErrorCode', () => {
    it('lit le code d’erreur renvoyé par back-platform', () => {
      const error = new AxiosError('conflict');
      error.response = { data: { error: 'pseudo_taken' } } as AxiosError['response'];

      expect(profileErrorCode(error)).toBe('pseudo_taken');
    });

    it('renvoie null pour une erreur sans code ou qui n’est pas une erreur HTTP', () => {
      expect(profileErrorCode(new AxiosError('network'))).toBeNull();
      expect(profileErrorCode(new Error('boom'))).toBeNull();
      expect(profileErrorCode(undefined)).toBeNull();
    });
  });

  describe('PSEUDO_PATTERN', () => {
    it.each(['abc', 'Lucy-2', 'a'.repeat(20)])('accepte %s', (pseudo) => {
      expect(PSEUDO_PATTERN.test(pseudo)).toBe(true);
    });

    it.each(['ab', 'a'.repeat(21), 'avec espace', 'accentué', '<b>', ''])(
      'refuse « %s »',
      (pseudo) => {
        expect(PSEUDO_PATTERN.test(pseudo)).toBe(false);
      },
    );
  });
});
