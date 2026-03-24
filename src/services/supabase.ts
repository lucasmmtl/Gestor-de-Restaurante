import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const storageBucket =
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "product-images";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY antes de usar o painel admin.",
    );
  }
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: AsyncStorage,
    },
    global: {
      headers: {
        "x-application-name": "gestor-restaurante",
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);
