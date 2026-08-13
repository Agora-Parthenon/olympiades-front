import { create } from 'zustand';

interface ConnectionState {
  isLost: boolean;
  markLost: () => void;
  markRestored: () => void;
}

/**
 * Reflète l'état de la connexion WebSocket temps réel — pas du client HTTP Axios.
 * Piloté par websocket.service.ts.
 */
export const useConnectionStore = create<ConnectionState>((set) => ({
  isLost: false,
  markLost: () => set({ isLost: true }),
  markRestored: () => set({ isLost: false }),
}));