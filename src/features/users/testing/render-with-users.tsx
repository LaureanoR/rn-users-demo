import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook } from "@testing-library/react-native";
import type { ReactElement, ReactNode } from "react";

import { UsersDependenciesProvider } from "../users.dependencies";
import type { UsersRepository } from "../users.repository";

function createWrapper(usersRepository: UsersRepository) {
  // Un QueryClient por test: la caché nunca se filtra de un test al siguiente.
  // gcTime infinito evita timers de recolección pendientes al terminar el test.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  function UsersTestProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <UsersDependenciesProvider value={{ usersRepository }}>
          {children}
        </UsersDependenciesProvider>
      </QueryClientProvider>
    );
  }
  return { queryClient, UsersTestProviders };
}

export function renderWithUsers(
  ui: ReactElement,
  usersRepository: UsersRepository,
) {
  const { queryClient, UsersTestProviders } = createWrapper(usersRepository);
  return { queryClient, rendered: render(ui, { wrapper: UsersTestProviders }) };
}

export function renderHookWithUsers<Result>(
  hook: () => Result,
  usersRepository: UsersRepository,
) {
  const { queryClient, UsersTestProviders } = createWrapper(usersRepository);
  return {
    queryClient,
    rendered: renderHook(hook, { wrapper: UsersTestProviders }),
  };
}
