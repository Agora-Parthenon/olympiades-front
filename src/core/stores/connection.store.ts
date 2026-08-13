import { create } from 'zustand';

interface ConnectionState {
  isConnected: boolean;
  isLost: boolean;
  markConnected: () => void;
  markDisconnected: () => void;
  markLost: () => void;
}

/**
 * Reflète l'état de la connexion WebSocket temps réel — pas du client HTTP Axios.
 * Piloté par websocket.service.ts.
 *
 * isConnected / isLost sont deux axes distincts : isConnected=false pendant les
 * tentatives de reconnexion silencieuses (1-3), isLost=true seulement après abandon.
 */
export const useConnectionStore = create<ConnectionState>((set) => ({
  isConnected: false,
  isLost: false,
  markConnected: () => set({ isConnected: true, isLost: false }),
  markDisconnected: () => set({ isConnected: false }),
  markLost: () => set({ isConnected: false, isLost: true }),
}));
