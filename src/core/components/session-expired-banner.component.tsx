import type { FC } from 'react';
import { Alert, Button } from '@mui/material';
import { login } from '../services/keycloak.service';
import { useSessionStore } from '../stores/session.store';

/**
 * Prévient l'utilisateur dont la session n'a pas pu être renouvelée (US-09, CA-02) et lui
 * propose de se reconnecter.
 */
const SessionExpiredBanner: FC = () => {
  const expired = useSessionStore((s) => s.expired);
  const clearExpired = useSessionStore((s) => s.clearExpired);

  if (!expired) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      variant="filled"
      sx={{ borderRadius: 0 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            clearExpired();
            void login();
          }}
        >
          Se connecter
        </Button>
      }
    >
      Votre session a expiré, veuillez vous reconnecter
    </Alert>
  );
};

export default SessionExpiredBanner;
