import type { Session } from "./auth.model";

/**
 * Puerto: dónde se persiste la sesión entre ejecuciones de la app.
 *
 * Contrato:
 * - `read` nunca rechaza: ante cualquier problema (dato corrupto, error del almacenamiento)
 *   devuelve `null`, para que un fallo de lectura no impida arrancar.
 * - `write` y `clear` rechazan si no pueden completarse.
 */
export interface SessionStorage {
  read(): Promise<Session | null>;
  write(session: Session): Promise<void>;
  clear(): Promise<void>;
}
