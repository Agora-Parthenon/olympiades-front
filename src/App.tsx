import type { FC } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import olympiadesTheme from './theme/olympiades.theme';
import { RouterProvider } from 'react-router';
import ConnectionLostBanner from './core/components/connection-lost-banner.component';
import { queryClient } from './core/services/query-client.service';
import { appRouter } from './router/app.router';

/**
 * Coquille applicative : thème, resets globaux, QueryClient partagé (cache des requêtes
 * REST — DAT §3.1) et routeur (en-tête, pages publiques et protégées).
 */
const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={olympiadesTheme}>
      <CssBaseline />
      <ConnectionLostBanner />
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
