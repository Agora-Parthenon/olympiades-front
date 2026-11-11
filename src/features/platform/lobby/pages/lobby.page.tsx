import type { FC } from 'react';
import { Stack, Typography } from '@mui/material';

/** Page réservée aux joueurs connectés. Contenu provisoire : les lobbies arrivent avec l'US-020. */
const LobbyPage: FC = () => (
  <Stack component="main" data-testid="lobby-page" spacing={2} sx={{ p: 4 }}>
    <Typography variant="h1">Lobby</Typography>
    <Typography color="text.secondary">Les parties en attente s’afficheront ici bientôt.</Typography>
  </Stack>
);

export default LobbyPage;
