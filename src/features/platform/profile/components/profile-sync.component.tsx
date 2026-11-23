import { useEffect } from 'react';
import type { FC } from 'react';
import { useUserStore } from '@/core/stores/user.store';
import { useMyProfile } from '../hooks/use-profile.hook';

/**
 * Ne s'affiche pas : charge le profil dès qu'un joueur est connecté (ce qui le crée à la première
 * connexion) et recopie son pseudo dans le store utilisateur, pour que l'en-tête affiche le pseudo
 * du profil — et son nouveau pseudo dès qu'il le modifie (US-015, CA-02) — plutôt que le nom Keycloak.
 */
const ProfileSync: FC = () => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { data: profile } = useMyProfile();

  useEffect(() => {
    if (user && profile && profile.pseudo !== user.pseudo) {
      setUser({ ...user, pseudo: profile.pseudo });
    }
  }, [user, profile, setUser]);

  return null;
};

export default ProfileSync;
