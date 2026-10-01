import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AppProviders, createContainer } from "@/composition";
import { SignOutButton, useSession } from "@/features/auth";

SplashScreen.preventAutoHideAsync();

const container = createContainer();

export default function RootLayout() {
  return (
    <AppProviders container={container}>
      <StatusBar style="auto" />
      <SplashScreenController />
      <RootNavigator />
    </AppProviders>
  );
}

// Mantiene visible el splash nativo hasta que se resuelve si hay una sesión guardada.
function SplashScreenController() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  return null;
}

function RootNavigator() {
  const isAuthenticated = useSession().status === "authenticated";

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="index"
          options={{ title: "Usuarios", headerRight: () => <SignOutButton /> }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
