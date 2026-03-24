import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { theme } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLayout() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);

  if (!session || profile?.role !== 'admin') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: theme.fonts.semiBold,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#090909',
          borderTopColor: theme.colors.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="grid" size={size} />,
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="pdv"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="cart" size={size} />,
          title: 'PDV',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="cube" size={size} />,
          title: 'Estoque',
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="restaurant" size={size} />,
          title: 'Cardapio',
        }}
      />
    </Tabs>
  );
}
