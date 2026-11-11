import type { FC } from 'react';
import { Link as RouterLink } from 'react-router';
import { Link, Stack, Typography } from '@mui/material';

/** Page affichée pour toute URL inconnue (US-013, CA-03). */
const NotFoundPage: FC = () => (
  <Stack
    component="main"
    data-testid="not-found-page"
    spacing={2}
    sx={{ alignItems: 'center', p: 4, textAlign: 'center' }}
  >
    <Typography variant="h1">404</Typography>
    <Typography>
      Cette page n’existe pas —{' '}
      <Link component={RouterLink} to="/">
        Retour à l’accueil
      </Link>
    </Typography>
  </Stack>
);

export default NotFoundPage;
