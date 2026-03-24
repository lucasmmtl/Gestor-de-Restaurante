import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { authService } from '@/services/auth-service';
import type { AdminProfile } from '@/types/models';

type AuthState = {
  bootstrap: () => Promise<() => void>;
  handleSession: (session: Session | null) => Promise<void>;
  initialized: boolean;
  loading: boolean;
  profile: AdminProfile | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  loading: false,
  profile: null,
  session: null,

  async handleSession(session) {
    const profile = session ? await authService.getProfile(session.user.id) : null;

    set({
      initialized: true,
      profile,
      session,
    });
  },

  async bootstrap() {
    try {
      const session = await authService.getSession();
      await get().handleSession(session);

      const subscription = authService.onAuthStateChange((nextSession) => {
        void get().handleSession(nextSession);
      });

      return subscription.unsubscribe;
    } catch {
      set({
        initialized: true,
        profile: null,
        session: null,
      });

      return () => undefined;
    }
  },

  async refreshProfile() {
    const session = get().session;

    if (!session) {
      set({ profile: null });
      return;
    }

    const profile = await authService.getProfile(session.user.id);
    set({ profile });
  },

  async signIn(email, password) {
    set({ loading: true });

    try {
      await authService.signIn(email, password);
    } finally {
      set({ loading: false });
    }
  },

  async signUp(email, password) {
    set({ loading: true });

    try {
      await authService.signUp(email, password);
    } finally {
      set({ loading: false });
    }
  },

  async signOut() {
    set({ loading: true });

    try {
      await authService.signOut();
      set({ profile: null, session: null });
    } finally {
      set({ loading: false });
    }
  },
}));
