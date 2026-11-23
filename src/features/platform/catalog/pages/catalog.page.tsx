import type { FC } from 'react';
import { Stack, Typography } from '@mui/material';

/** Page publique du catalogue. Contenu provisoire : la liste des jeux arrive avec l'US-018. */
const CatalogPage: FC = () => (
  <Stack component="main" data-testid="catalog-page" spacing={2} sx={{ p: 4 }}>
    <Typography variant="h1">Catalogue</Typography>
    <Typography color="text.secondary">Les jeux disponibles s’afficheront ici bientôt.</Typography>
  </Stack>
);

export default CatalogPage;
