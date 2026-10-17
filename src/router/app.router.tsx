import { createBrowserRouter } from 'react-router';
import AppLayout from '@/core/components/app-layout.component';
import ProtectedRoute from '@/core/components/protected-route.component';
import HomePage from '@/features/platform/home/pages/home.page';
import ProfilePage from '@/features/platform/profile/pages/profile.page';

/**
 * Routes de l'application. Les pages réservées aux utilisateurs connectés se déclarent
 * sous ProtectedRoute ; les autres restent publiques.
 */
export const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/profil', element: <ProfilePage /> }],
      },
    ],
  },
];

export const appRouter = createBrowserRouter(routes);
