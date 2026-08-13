import type { FC } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import olympiadesTheme from './theme/olympiades.theme';
import HomePage from './features/platform/home/pages/home.page';
import ConnectionLostBanner from './core/components/connection-lost-banner.component';
import { queryClient } from './core/services/query-client.service';

/**
 * Coquille applicative : thème, resets globaux et QueryClient partagé (cache des requêtes
 * REST — DAT §3.1). La navigation viendra s'insérer ici (US-13).
 */
const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={olympiadesTheme}>
      <CssBaseline />
      <ConnectionLostBanner />
      <HomePage />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
