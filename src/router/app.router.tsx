import { createBrowserRouter } from 'react-router';
import AppLayout from '@/core/components/app-layout.component';
import ProtectedRoute from '@/core/components/protected-route.component';
import CatalogPage from '@/features/platform/catalog/pages/catalog.page';
import HomePage from '@/features/platform/home/pages/home.page';
import LobbyPage from '@/features/platform/lobby/pages/lobby.page';
import NotFoundPage from '@/features/platform/not-found/pages/not-found.page';
import ProfilePage from '@/features/platform/profile/pages/profile.page';

/**
 * Routes de l'application. Les pages réservées aux utilisateurs connectés se déclarent
 * sous ProtectedRoute ; les autres restent publiques. Toute URL inconnue tombe sur la page 404,
 * qui garde l'en-tête pour permettre de naviguer ailleurs.
 */
export const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalogue', element: <CatalogPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/profil', element: <ProfilePage /> },
          { path: '/lobby', element: <LobbyPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const appRouter = createBrowserRouter(routes);
