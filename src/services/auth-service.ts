import type { Session } from '@supabase/supabase-js';

import { ensureSupabaseConfigured, supabase } from '@/services/supabase';
import type { AdminProfile } from '@/types/models';

export const authService = {
  async getSession() {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  },

  async getProfile(userId: string) {
    ensureSupabaseConfigured();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as AdminProfile | null;
  },

  async signIn(email: string, password: string) {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  },

  async signUp(email: string, password: string) {
    ensureSupabaseConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async signOut() {
    ensureSupabaseConfigured();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
