import { QueryClient } from "@tanstack/react-query";

import {
  MockAuthRepository,
  SecureStoreSessionStorage,
  type AuthDependencies,
} from "@/features/auth";
import {
  FallbackUsersRepository,
  FixtureUsersRepository,
  RandomUserRepository,
  type UsersDependencies,
} from "@/features/users";
import { AxiosHttpClient } from "@/shared/http";

import { API_BASE_URL, HTTP_TIMEOUT_MS } from "./config";

export interface Container {
  queryClient: QueryClient;
  auth: AuthDependencies;
  users: UsersDependencies;
}

/** Único lugar que conoce las clases concretas y decide cómo se combinan. */
export function createContainer(): Container {
  const http = new AxiosHttpClient({
    baseURL: API_BASE_URL,
    timeoutMs: HTTP_TIMEOUT_MS,
  });
  // Sin focusManager ni onlineManager a propósito: con networkMode "online" una
  // conexión marcada como caída pausaría las queries y el fallback nunca se usaría.
  const queryClient = new QueryClient();

  return {
    queryClient,
    auth: {
      authRepository: new MockAuthRepository(),
      sessionStorage: new SecureStoreSessionStorage(),
      // Al cerrar sesión se descarta lo cacheado, para que el próximo usuario no vea datos ajenos.
      onSignedOut: () => queryClient.clear(),
    },
    users: {
      usersRepository: new FallbackUsersRepository(
        new RandomUserRepository(http),
        new FixtureUsersRepository(),
      ),
    },
  };
}
