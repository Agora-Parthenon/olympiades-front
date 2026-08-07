import type { FC } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import olympiadesTheme from './theme/olympiades.theme';
import HomePage from './features/platform/home/pages/home.page';
import ConnectionLostBanner from './core/components/connection-lost-banner.component';

/**
 * Coquille applicative : thème et resets globaux. La navigation viendra s'insérer ici (US-13).
 */
const App: FC = () => (
  <ThemeProvider theme={olympiadesTheme}>
    <CssBaseline />
    <ConnectionLostBanner />
    <HomePage />
  </ThemeProvider>
);

export default App;