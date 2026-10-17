import type { FC } from 'react';
import { AppBar, Button, Stack, Toolbar, Typography } from '@mui/material';
import { login, logout } from '../services/keycloak.service';
import { useUserStore } from '../stores/user.store';

/**
 * En-tête du site : affiche le pseudo de l'utilisateur connecté (US-08, CA-01),
 * ou le bouton "Se connecter" pour un visiteur.
 */
const AppHeader: FC = () => {
  const user = useUserStore((s) => s.user);

  return (
    <AppBar position="static" color="primary" elevation={0} component="header">
      <Toolbar>
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Olympiades
        </Typography>

        {user ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography data-testid="header-pseudo">{user.pseudo}</Typography>
            <Button color="inherit" variant="outlined" onClick={() => logout()}>
              Se déconnecter
            </Button>
          </Stack>
        ) : (
          <Button color="inherit" variant="outlined" onClick={() => login()}>
            Se connecter
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
