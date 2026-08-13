import { create } from 'zustand';

export interface ConnectedUser {
  id: string;
  pseudo: string;
  roles: string[];
}

interface UserState {
  user: ConnectedUser | null;
  setUser: (user: ConnectedUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
