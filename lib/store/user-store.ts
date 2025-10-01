import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export type User = {
  id: string;
  username: string | null;
  role: string; // From enum: 'user', 'rrpp', etc.
  birthDate: Date | null;
  dni: string | null;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
};

export type UserStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (session?: UserSession) => Promise<void>;
  logout: () => void;
};

const userStore = (set: any) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async (userSession?: UserSession) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/user/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      if(userSession){
        data.image = userSession.image;
        data.name = userSession.name;
        data.email = userSession.email;
        data.emailVerified = userSession.emailVerified;
        data.createdAt = userSession.createdAt;
        data.updatedAt = userSession.updatedAt;
      }
      set({ user: { ...data, tickets: data.tickets || [] }, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
  logout: async () => {
    set({ user: null });
  },
})

export const useUserStore = create<UserStore>()(
  persist(userStore, {
    name: 'user-storage',
    // Evita hydration mismatch: solo hidrata después del montaje en cliente
    skipHydration: typeof window === 'undefined',
  })
);

export type UserSession ={
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined | undefined;
};