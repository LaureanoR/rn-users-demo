import type { Credentials, Session } from "./auth.model";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Credenciales inválidas");
    // Garantiza que `instanceof` funcione sin importar cómo se transpile la clase.
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    this.name = "InvalidCredentialsError";
  }
}

export function isInvalidCredentialsError(
  error: unknown,
): error is InvalidCredentialsError {
  return error instanceof InvalidCredentialsError;
}

/**
 * Puerto: cómo se autentica un usuario, sin importar contra qué.
 * `signIn` rechaza con `InvalidCredentialsError` si las credenciales no son válidas.
 */
export interface AuthRepository {
  signIn(credentials: Credentials): Promise<Session>;
}
