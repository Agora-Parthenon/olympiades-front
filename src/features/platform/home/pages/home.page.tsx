import type { FC } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { getGatewayUrl } from '@/core/services/config.service';

const HomePage: FC = () => (
  <Stack
    component="main"
    data-testid="home-page"
    spacing={3}
    sx={{
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      textAlign: 'center',
    }}
  >
    <Typography variant="h1">Olympiades</Typography>

    <Typography color="text.secondary" sx={{ maxWidth: '28rem' }}>
      Plateforme de jeux de société en ligne. Le socle applicatif est en place — les fonctionnalités
      arrivent avec les prochaines User Stories.
    </Typography>

    <Button
      variant="contained"
      href={`${getGatewayUrl()}/health`}
      data-testid="home-gateway-health-link"
    >
      Vérifier la gateway
    </Button>
  </Stack>
);

export default HomePage;
