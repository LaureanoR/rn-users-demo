import type { AuthRepository } from "../auth.repository";
import type { Credentials, Session } from "../auth.model";
import type { SessionStorage } from "../session.storage";

export const SESSION: Session = {
  token: "test-token",
  user: { id: "user-1", name: "Ada Lovelace", email: "ada@example.com" },
};

/** SessionStorage en memoria, con fallos configurables para probar los caminos de error. */
export class InMemorySessionStorage implements SessionStorage {
  value: Session | null;
  failOnWrite = false;
  failOnClear = false;
  readonly calls: string[] = [];

  constructor(initial: Session | null = null) {
    this.value = initial;
  }

  async read(): Promise<Session | null> {
    this.calls.push("read");
    return this.value;
  }

  async write(session: Session): Promise<void> {
    this.calls.push("write");
    if (this.failOnWrite) {
      throw new Error("write failed");
    }
    this.value = session;
  }

  async clear(): Promise<void> {
    this.calls.push("clear");
    if (this.failOnClear) {
      throw new Error("clear failed");
    }
    this.value = null;
  }
}

/** AuthRepository que acepta o rechaza según la función recibida. */
export class FakeAuthRepository implements AuthRepository {
  readonly calls: Credentials[] = [];
  private readonly handler: (credentials: Credentials) => Promise<Session>;

  constructor(
    handler: (credentials: Credentials) => Promise<Session> = async () =>
      SESSION,
  ) {
    this.handler = handler;
  }

  signIn(credentials: Credentials): Promise<Session> {
    this.calls.push(credentials);
    return this.handler(credentials);
  }
}
