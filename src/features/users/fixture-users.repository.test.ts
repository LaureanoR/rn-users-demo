import { FixtureUsersRepository } from "./fixture-users.repository";
import { USERS_PAGE_SIZE, USERS_TOTAL } from "./users.config";

describe("FixtureUsersRepository", () => {
  const repository = new FixtureUsersRepository();
  const lastPage = USERS_TOTAL / USERS_PAGE_SIZE;

  it("devuelve páginas de 100 usuarios marcadas como fixture", async () => {
    const page = await repository.getPage({ page: 1 });

    expect(page.users).toHaveLength(USERS_PAGE_SIZE);
    expect(page).toMatchObject({ page: 1, nextPage: 2, source: "fixture" });
  });

  it("la última página no tiene siguiente", async () => {
    const page = await repository.getPage({ page: lastPage });

    expect(page.users).toHaveLength(USERS_PAGE_SIZE);
    expect(page.nextPage).toBeNull();
  });

  it("más allá del final devuelve una página vacía en lugar de fallar", async () => {
    expect((await repository.getPage({ page: lastPage + 1 })).users).toEqual(
      [],
    );
  });

  it("el fixture completo tiene 2000 usuarios únicos y bien formados", async () => {
    const pages = await Promise.all(
      Array.from({ length: lastPage }, (_, index) =>
        repository.getPage({ page: index + 1 }),
      ),
    );
    const users = pages.flatMap((page) => page.users);

    expect(users).toHaveLength(USERS_TOTAL);
    expect(new Set(users.map((user) => user.id)).size).toBe(USERS_TOTAL);
    expect(
      users.every(
        (user) => user.fullName.trim() && user.email && user.avatarUrl,
      ),
    ).toBe(true);
  });
});
