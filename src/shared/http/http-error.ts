export type HttpErrorKind = "network" | "timeout" | "canceled" | "http";

interface HttpErrorOptions {
  status?: number;
  cause?: unknown;
}

/**
 * Error normalizado del cliente HTTP. `message` es para logs; la UI decide
 * qué texto mostrar a partir de `kind`.
 */
export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status?: number;

  constructor(
    kind: HttpErrorKind,
    message: string,
    { status, cause }: HttpErrorOptions = {},
  ) {
    super(message);
    // Garantiza que `instanceof HttpError` funcione sin importar cómo se transpile la clase.
    Object.setPrototypeOf(this, HttpError.prototype);
    this.name = "HttpError";
    this.kind = kind;
    this.status = status;
    this.cause = cause;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
