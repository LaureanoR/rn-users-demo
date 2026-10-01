import type { Credentials, Session } from "./auth.model";
import {
  InvalidCredentialsError,
  type AuthRepository,
} from "./auth.repository";
import { DEMO_CREDENTIALS, DEMO_USER } from "./demo-user";

const LATENCY_MS = 800;

/** Autenticación simulada: no hay backend, expiración ni refresco de token. */
export class MockAuthRepository implements AuthRepository {
  async signIn({ email, password }: Credentials): Promise<Session> {
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    const isDemoUser =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;
    if (!isDemoUser) {
      throw new InvalidCredentialsError();
    }

    return { token: createMockToken(), user: DEMO_USER };
  }
}

function createMockToken(): string {
  return `mock.${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
}
