import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/core/services/http-client.service';

export interface GatewayHealth {
  status: string;
}

/**
 * Exemple de brique "feature" au-dessus des services core : useQuery encapsule le cache,
 * l'état de chargement/erreur, et rejoue getHealth() via le httpClient partagé (donc avec
 * le token joint automatiquement — CA-01).
 *
 * enabled: false + refetch() car ce health-check est déclenché à la demande (clic), pas au
 * montage du composant. staleTime (défini dans le QueryClient global) évite de re-frapper la
 * gateway si on reclique dans la fenêtre de fraîcheur.
 */
export function useGatewayHealth() {
  return useQuery({
    queryKey: ['gateway', 'health'],
    queryFn: async (): Promise<GatewayHealth> => {
      const { data } = await httpClient.get<GatewayHealth>('/health');
      return data;
    },
    enabled: false,
  });
}
