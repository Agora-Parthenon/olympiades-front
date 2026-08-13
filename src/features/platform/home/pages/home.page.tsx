import type { FC } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { login } from '@/core/services/keycloak.service';
import { useGatewayHealth } from '../hooks/use-gateway-health.hook';

const HomePage: FC = () => {
  const { data, error, isFetching, refetch } = useGatewayHealth();

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
        onClick={() => refetch()}
        disabled={isFetching}
        data-testid="home-gateway-health-link"
      >
        {isFetching ? 'Vérification…' : 'Vérifier la gateway'}
      </Button>

      {data && (
        <Typography color="success.main" data-testid="home-gateway-health-status">
          Gateway : {data.status}
        </Typography>
      )}

      {error && (
        <Typography color="error.main" data-testid="home-gateway-health-error">
          Gateway injoignable
        </Typography>
      )}

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