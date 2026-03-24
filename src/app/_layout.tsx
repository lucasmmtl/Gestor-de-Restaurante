import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  useFonts,
} from "@expo-google-fonts/sora";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "@/components/loading-screen";
import { theme } from "@/constants/theme";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialized = useAuthStore((state) => state.initialized);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);

    let unsubscribe: () => void = () => {};

    void (async () => {
      unsubscribe = await useAuthStore.getState().bootstrap();
      setAuthBootstrapped(true);
    })();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && initialized && authBootstrapped) {
      void SplashScreen.hideAsync();
    }
  }, [authBootstrapped, fontsLoaded, initialized]);

  if (!fontsLoaded || !initialized || !authBootstrapped) {
    return <LoadingScreen message="Preparando painel Gestor Restaurante..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ animation: "fade", headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(admin)" />
          </Stack>
          <StatusBar style="light" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
