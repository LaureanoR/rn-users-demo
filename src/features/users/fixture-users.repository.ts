import type { RandomUserDto } from "./random-user.dto";
import { toUser } from "./user.mapper";
import { getNextPage, USERS_PAGE_SIZE } from "./users.config";
import type {
  GetUsersPageParams,
  UsersPage,
  UsersRepository,
} from "./users.repository";

export class FixtureUsersRepository implements UsersRepository {
  async getPage({ page }: GetUsersPageParams): Promise<UsersPage> {
    // Carga diferida: evita evaluar ~660 KB de JSON al arrancar si nunca se usa el fixture.
    const { default: fixture } = await import("./users.fixture.json");
    const start = (page - 1) * USERS_PAGE_SIZE;
    // La asignación tipada hace que TypeScript verifique que el fixture respeta el DTO.
    const dtos: RandomUserDto[] = fixture.slice(start, start + USERS_PAGE_SIZE);

    return {
      users: dtos.map(toUser),
      page,
      nextPage: getNextPage(page),
      source: "fixture",
    };
  }
}
