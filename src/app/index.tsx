import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function IndexScreen() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  if (session && profile?.role === 'admin') {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/login" />;
}
