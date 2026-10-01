import { HttpError } from "@/shared/http";

import type { RandomUserDto } from "../random-user.dto";
import type {
  GetUsersPageParams,
  UsersPage,
  UsersRepository,
} from "../users.repository";

export function makeDto(n: number): RandomUserDto {
  return {
    login: { uuid: `uuid-${n}` },
    name: { first: `Nombre${n}`, last: `Apellido${n}` },
    email: `user${n}@example.com`,
    picture: {
      large: `https://img.test/large/${n}.jpg`,
      medium: `https://img.test/med/${n}.jpg`,
      thumbnail: `https://img.test/thumb/${n}.jpg`,
    },
  };
}

export function makePage(
  page: number,
  source: UsersPage["source"] = "live",
): UsersPage {
  return {
    users: [
      {
        id: `uuid-${page}`,
        fullName: `Nombre${page} Apellido${page}`,
        email: `user${page}@example.com`,
        avatarUrl: `https://img.test/large/${page}.jpg`,
      },
    ],
    page,
    nextPage: page < 3 ? page + 1 : null,
    source,
  };
}

/** Una única página, sin siguiente: evita que la lista dispare cargas adicionales en el test. */
export function makeSinglePage(
  page: number,
  source: UsersPage["source"] = "live",
): UsersPage {
  return { ...makePage(page, source), nextPage: null };
}

export const networkError = () => new HttpError("network", "sin conexión");

/** UsersRepository cuyo comportamiento por página define el test. */
export class FakeUsersRepository implements UsersRepository {
  readonly calls: GetUsersPageParams[] = [];
  private readonly handler: (params: GetUsersPageParams) => Promise<UsersPage>;

  constructor(
    handler: (params: GetUsersPageParams) => Promise<UsersPage> = async ({
      page,
    }) => makePage(page),
  ) {
    this.handler = handler;
  }

  getPage(params: GetUsersPageParams): Promise<UsersPage> {
    this.calls.push(params);
    return this.handler(params);
  }
}
