import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initKeycloak } from './core/services/keycloak.service';

initKeycloak()
  .catch((error: unknown) => {
    console.error('Échec de l’initialisation Keycloak :', error);
    return false;
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
