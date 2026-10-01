import type { User } from "./user.model";

export type UsersSource = "live" | "fixture";

export interface UsersPage {
  users: User[];
  page: number;
  nextPage: number | null;
  source: UsersSource;
}

export interface GetUsersPageParams {
  page: number;
  signal?: AbortSignal;
}

/** Puerto: de dónde salen los usuarios, sin importar cómo se obtengan. */
export interface UsersRepository {
  getPage(params: GetUsersPageParams): Promise<UsersPage>;
}
