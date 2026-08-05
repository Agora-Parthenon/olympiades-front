import { createTheme } from '@mui/material';

/**
 * Thème unique de la plateforme. Toute couleur, rayon ou réglage typographique passe par ici :
 * aucun composant ne code de valeur en dur.
 */
const olympiadesTheme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',
      contrastText: '#fafafa',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default olympiadesTheme;
