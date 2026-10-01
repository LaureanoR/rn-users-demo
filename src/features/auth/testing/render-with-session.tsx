import { render } from "@testing-library/react-native";
import type { ReactElement } from "react";

import type { AuthDependencies } from "../auth.dependencies";
import { SessionProvider } from "../SessionProvider";
import { FakeAuthRepository, InMemorySessionStorage } from "./fakes";

/** Renderiza un elemento dentro del SessionProvider real, con dependencias falsas por defecto. */
export function renderWithSession(
  ui: ReactElement,
  overrides: Partial<AuthDependencies> = {},
) {
  const dependencies: AuthDependencies = {
    authRepository: new FakeAuthRepository(),
    sessionStorage: new InMemorySessionStorage(),
    ...overrides,
  };
  return {
    dependencies,
    rendered: render(
      <SessionProvider dependencies={dependencies}>{ui}</SessionProvider>,
    ),
  };
}
