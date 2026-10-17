import { useEffect } from 'react';
import type { FC } from 'react';
import { Outlet } from 'react-router';
import { login } from '../services/keycloak.service';
import { useUserStore } from '../stores/user.store';

/**
 * Garde des pages réservées aux utilisateurs connectés (US-08, CA-03).
 * Sans session, on redirige vers la page de login Keycloak en demandant d'y revenir
 * une fois connecté : l'utilisateur retrouve la page qu'il avait demandée.
 */
const ProtectedRoute: FC = () => {
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      void login(window.location.href);
    }
  }, [user]);

  return user ? <Outlet /> : null;
};

export default ProtectedRoute;
