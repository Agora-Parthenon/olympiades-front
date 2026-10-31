import { create } from 'zustand';

interface SessionState {
  /** Vrai quand la session n'a pas pu être renouvelée (US-09, CA-02) */
  expired: boolean;
  markExpired: () => void;
  clearExpired: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  expired: false,
  markExpired: () => set({ expired: true }),
  clearExpired: () => set({ expired: false }),
}));
