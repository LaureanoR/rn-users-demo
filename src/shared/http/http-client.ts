export interface HttpGetOptions {
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

/**
 * Puerto: lo único que los repositorios saben del transporte HTTP.
 *
 * Contrato que debe cumplir toda implementación:
 * - `get` resuelve con el cuerpo parseado: JSON si es posible, texto si no.
 * - Toda falla se rechaza con `HttpError`. `kind` y `status` están garantizados;
 *   `cause` es informativa.
 * - Superar el timeout rechaza con `kind: "timeout"`; abortar el `signal`, con
 *   `kind: "canceled"`.
 *
 * Los métodos nuevos se agregan cuando un consumidor los necesita.
 */
export interface HttpClient {
  get<T>(url: string, options?: HttpGetOptions): Promise<T>;
}
