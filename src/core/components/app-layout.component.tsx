import type { FC } from 'react';
import { Outlet } from 'react-router';
import AppHeader from './app-header.component';

/** Gabarit commun à toutes les pages : en-tête puis contenu de la route courante. */
const AppLayout: FC = () => (
  <>
    <AppHeader />
    <Outlet />
  </>
);

export default AppLayout;
