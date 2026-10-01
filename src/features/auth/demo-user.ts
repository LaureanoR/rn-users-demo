import type { AuthUser, Credentials } from "./auth.model";

/** Único usuario válido del mock de autenticación. Se publica en el README. */
export const DEMO_CREDENTIALS: Credentials = {
  email: "demo@example.com",
  password: "Demo2026!",
};

export const DEMO_USER: AuthUser = {
  id: "demo-user",
  name: "Usuario Demo",
  email: DEMO_CREDENTIALS.email,
};
