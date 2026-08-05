import type { FC } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import olympiadesTheme from './theme/olympiades.theme';
import HomePage from './features/platform/home/pages/home.page';

/**
 * Coquille applicative : thème et resets globaux. La navigation viendra s'insérer ici (US-13).
 */
const App: FC = () => (
  <ThemeProvider theme={olympiadesTheme}>
    <CssBaseline />
    <HomePage />
  </ThemeProvider>
);

export default App;
