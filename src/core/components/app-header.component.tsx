import type { FC } from 'react';
import { AppBar, Button, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router';
import { login, logout } from '../services/keycloak.service';
import { useUserStore } from '../stores/user.store';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/lobby', label: 'Lobby' },
  { to: '/profil', label: 'Profil' },
];

/**
 * En-tête du site : affiche le pseudo de l'utilisateur connecté (US-08, CA-01),
 * ou le bouton "Se connecter" pour un visiteur.
 */
const AppHeader: FC = () => {
  const user = useUserStore((s) => s.user);

  return (
    <AppBar position="static" color="primary" elevation={0} component="header">
      <Toolbar>
        <Typography variant="h6" component="span" sx={{ mr: 3 }}>
          Olympiades
        </Typography>

        {/* Liens du menu : react-router évite le rechargement complet de la page (US-013, CA-01) */}
        <Stack
          component="nav"
          aria-label="Navigation principale"
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1 }}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Button key={to} color="inherit" component={NavLink} to={to} end>
              {label}
            </Button>
          ))}
        </Stack>

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
