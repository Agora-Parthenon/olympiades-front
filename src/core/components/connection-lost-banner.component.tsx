import type { FC } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useConnectionStore } from '../stores/connection.store';

const ConnectionLostBanner: FC = () => {
  const isLost = useConnectionStore((s) => s.isLost);

  return (
    <Snackbar open={isLost} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="error" variant="filled">
        Connexion au serveur perdue. Vérifiez votre réseau puis rechargez la page.
      </Alert>
    </Snackbar>
  );
};

export default ConnectionLostBanner;