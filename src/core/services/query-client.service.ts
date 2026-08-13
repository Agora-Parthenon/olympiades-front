import { QueryClient } from '@tanstack/react-query';

/**
 * Instance unique de QueryClient pour toute l'app (montée dans App.tsx via
 * QueryClientProvider). TanStack Query gère le cache des requêtes REST — voir
 * DAT §3.1 : réservé au REST via httpClient, jamais au temps réel jeux (WebSocket/STOMP),
 * qui est géré séparément par websocket.service.ts + connection.store.ts.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Une requête essaie une fois, puis échoue vite plutôt que de retenter en boucle
      // en silence — on préfère un état d'erreur explicite dans la feature.
      retry: 1,
      // 30s avant qu'une donnée en cache soit considérée périmée : évite de
      // re-frapper la gateway à chaque changement de focus de fenêtre par défaut.
      staleTime: 30_000,
    },
  },
});
