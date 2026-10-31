import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Navigate, Outlet } from 'react-router';
import { login } from '../services/keycloak.service';
import { useSessionStore } from '../stores/session.store';
import { useUserStore } from '../stores/user.store';

/**
 * Garde des pages réservées aux utilisateurs connectés (US-08, CA-03).
 * Un visiteur qui arrive sans session est redirigé vers la page de login Keycloak, en demandant
 * d'y revenir une fois connecté : il retrouve la page qu'il avait demandée.
 *
 * Un utilisateur qui perd sa session pendant qu'il est sur la page (US-09, CA-02) n'est en revanche
 * PAS renvoyé directement vers Keycloak : on le ramène sur l'accueil, où l'alerte "Votre session
 * a expiré" lui explique ce qui s'est passé. Il ne suffit pas de lire le drapeau d'expiration :
 * keycloak-js vide l'utilisateur un instant avant que la session soit marquée comme expirée.
 */
const ProtectedRoute: FC = () => {
  const user = useUserStore((s) => s.user);
  const sessionExpired = useSessionStore((s) => s.expired);
  const [hadUser, setHadUser] = useState(user !== null);

  // Ajustement d'état pendant le rendu (motif documenté par React) : on retient qu'un
  // utilisateur a été présent, pour distinguer "arrive sans session" de "perd sa session".
  if (user && !hadUser) {
    setHadUser(true);
  }
  const lostSession = !user && (hadUser || sessionExpired);

  useEffect(() => {
    if (!user && !lostSession) {
      void login(window.location.href);
    }
  }, [user, lostSession]);

  if (user) {
    return <Outlet />;
  }

  return lostSession ? <Navigate to="/" replace /> : null;
};

export default ProtectedRoute;
