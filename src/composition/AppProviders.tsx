import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "expo-router";
import type { ReactNode } from "react";

import { SessionProvider } from "@/features/auth";
import { UsersDependenciesProvider } from "@/features/users";

import type { Container } from "./create-container";
import { useNavigationTheme } from "./use-navigation-theme";

interface AppProvidersProps {
  container: Container;
  children: ReactNode;
}

export function AppProviders({ container, children }: AppProvidersProps) {
  const navigationTheme = useNavigationTheme();

  return (
    <ThemeProvider value={navigationTheme}>
      <QueryClientProvider client={container.queryClient}>
        <UsersDependenciesProvider value={container.users}>
          <SessionProvider dependencies={container.auth}>
            {children}
          </SessionProvider>
        </UsersDependenciesProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
