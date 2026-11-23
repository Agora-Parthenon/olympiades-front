import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/core/stores/user.store';
import {
  ensureProfile,
  getAvatars,
  updateProfile,
  type ProfileUpdate,
} from '../services/profile.service';

const profileKey = (userId: string | undefined) => ['profile', 'me', userId] as const;

/**
 * Le profil du joueur connecté. Il passe par ensureProfile (POST, idempotent) plutôt que par un
 * simple GET : le profil est ainsi créé à la première connexion (US-014) même si la page
 * "Mon profil" est ouverte avant que rien d'autre n'ait appelé l'API.
 */
export function useMyProfile() {
  const userId = useUserStore((s) => s.user?.id);

  return useQuery({
    queryKey: profileKey(userId),
    queryFn: ensureProfile,
    enabled: userId !== undefined,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useUserStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateProfile(update),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey(userId), profile);
    },
  });
}

export function useAvatars() {
  return useQuery({
    queryKey: ['profile', 'avatars'],
    queryFn: getAvatars,
    staleTime: Infinity,
  });
}
