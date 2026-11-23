import type { FC } from 'react';
import { Outlet } from 'react-router';
import AppHeader from './app-header.component';
import ProfileSync from '@/features/platform/profile/components/profile-sync.component';
import SessionExpiredBanner from './session-expired-banner.component';

/** Gabarit commun à toutes les pages : en-tête, alerte de session, puis contenu de la route. */
const AppLayout: FC = () => (
  <>
    <AppHeader />
    <ProfileSync />
    <SessionExpiredBanner />
    <Outlet />
  </>
);

export default AppLayout;
