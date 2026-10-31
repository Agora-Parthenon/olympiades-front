import type { FC } from 'react';
import { Stack, Typography } from '@mui/material';
import { useUserStore } from '@/core/stores/user.store';

/**
 * Page réservée aux utilisateurs connectés. Contenu minimal : elle sert ici de page protégée
 * de référence (US-08, CA-03) ; le vrai profil arrivera avec sa propre User Story.
 */
const ProfilePage: FC = () => {
  const user = useUserStore((s) => s.user);

  return (
    <Stack component="main" data-testid="profile-page" spacing={2} sx={{ p: 4 }}>
      <Typography variant="h1">Mon profil</Typography>
      <Typography color="text.secondary">Connecté en tant que {user?.pseudo}</Typography>
    </Stack>
  );
};

export default ProfilePage;
