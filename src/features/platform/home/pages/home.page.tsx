import type { FC } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { httpClient } from '@/core/services/http-client.service';
import { login } from '@/core/services/keycloak.service';

const HomePage: FC = () => {
  const checkHealth = async () => {
    try {
      const response = await httpClient.get('/health');
      console.log(response.data);
    } catch (error) {
      console.error('Gateway health check failed', error);
    }
  };

  return (
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
      <Typography variant="h1">
        Olympiades
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: '28rem' }}>
        Plateforme de jeux de société en ligne. Le socle applicatif est en place — les fonctionnalités
        arrivent avec les prochaines User Stories.
      </Typography>

      <Button
        variant="contained"
        onClick={checkHealth}
        data-testid="home-gateway-health-link"
      >
        Vérifier la gateway
      </Button>

      <Button
        variant="outlined"
        onClick={() => login()}
      >
        Se connecter
      </Button>
    </Stack>
  );
};

export default HomePage;