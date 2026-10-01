import { isHttpError } from "@/shared/http";

import type {
  GetUsersPageParams,
  UsersPage,
  UsersRepository,
} from "./users.repository";

/**
 * Decorador: usa `primary` y, si falla por un problema de transporte, recurre a `fallback`.
 * No intercepta las cancelaciones (son intencionales) ni los errores que no son HttpError:
 * un bug propio debe verse, no quedar tapado por los datos de ejemplo.
 */
export class FallbackUsersRepository implements UsersRepository {
  private readonly primary: UsersRepository;
  private readonly fallback: UsersRepository;

  constructor(primary: UsersRepository, fallback: UsersRepository) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async getPage(params: GetUsersPageParams): Promise<UsersPage> {
    try {
      return await this.primary.getPage(params);
    } catch (error) {
      if (!isHttpError(error) || error.kind === "canceled") {
        throw error;
      }
      return this.fallback.getPage(params);
    }
  }
}
