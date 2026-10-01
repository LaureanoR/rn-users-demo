import { act, waitFor } from "@testing-library/react-native";

import { FixtureUsersRepository } from "./fixture-users.repository";

import { FakeUsersRepository, makePage, networkError } from "./testing/fakes";
import { renderHookWithUsers } from "./testing/render-with-users";
import { useUsers } from "./use-users";
import type { UsersPage } from "./users.repository";

/** Una página cuya respuesta controla el test, para observar qué pasa "en vuelo". */
function deferred() {
  let resolve: (page: UsersPage) => void = () => {};
  const promise = new Promise<UsersPage>((r) => (resolve = r));
  return { promise, resolve };
}

describe("useUsers", () => {
  it("acumula las páginas en una sola lista", async () => {
    const repository = new FakeUsersRepository();
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.users).toHaveLength(1));

    await act(async () => result.current.loadMore());

    await waitFor(() => expect(result.current.users).toHaveLength(2));
    expect(result.current.users.map((user) => user.id)).toEqual([
      "uuid-1",
      "uuid-2",
    ]);
    expect(repository.calls.map((call) => call.page)).toEqual([1, 2]);
  });

  it("loadMore repetido mientras se pide una página no cancela ni duplica la request", async () => {
    const second = deferred();
    const repository = new FakeUsersRepository(({ page }) =>
      page === 2 ? second.promise : Promise.resolve(makePage(page)),
    );
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.users).toHaveLength(1));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(true));
    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(repository.calls.map((call) => call.page)).toEqual([1, 2]);
    expect(repository.calls[1].signal?.aborted).toBe(false);

    await act(async () => second.resolve(makePage(2)));
    await waitFor(() => expect(result.current.users).toHaveLength(2));
  });

  it("no pide más cuando ya llegó a la última página", async () => {
    const repository = new FakeUsersRepository(async ({ page }) => ({
      ...makePage(page),
      nextPage: null,
    }));
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.users).toHaveLength(1));

    await act(async () => result.current.loadMore());

    expect(repository.calls).toHaveLength(1);
  });

  it("en estado de error loadMore no reintenta (evita reintentos en cadena)", async () => {
    const repository = new FakeUsersRepository(async () => {
      throw networkError();
    });
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.isError).toBe(true));

    await act(async () => result.current.loadMore());

    expect(repository.calls).toHaveLength(1);
  });

  it("restart descarta lo acumulado y vuelve a la primera página", async () => {
    const repository = new FakeUsersRepository();
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.users).toHaveLength(1));
    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.users).toHaveLength(2));

    await act(async () => result.current.restart());

    await waitFor(() => expect(result.current.users).toHaveLength(1));
    expect(repository.calls.map((call) => call.page)).toEqual([1, 2, 1]);
  });

  it("con el fixture real recorre las 20 páginas hasta las 2000 y se detiene", async () => {
    const repository = new FixtureUsersRepository();
    const getPage = jest.spyOn(repository, "getPage");
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;

    for (let page = 1; page <= 20; page++) {
      await waitFor(() =>
        expect(result.current.users).toHaveLength(page * 100),
      );
      await act(async () => result.current.loadMore());
    }

    expect(result.current.users).toHaveLength(2000);
    expect(new Set(result.current.users.map((user) => user.id)).size).toBe(
      2000,
    );
    expect(getPage).toHaveBeenCalledTimes(20);
  });

  it("usesFixture refleja si alguna página vino del fixture", async () => {
    const repository = new FakeUsersRepository(async ({ page }) =>
      makePage(page, page === 1 ? "live" : "fixture"),
    );
    const { rendered } = renderHookWithUsers(useUsers, repository);
    const { result } = await rendered;
    await waitFor(() => expect(result.current.users).toHaveLength(1));
    expect(result.current.usesFixture).toBe(false);

    await act(async () => result.current.loadMore());

    await waitFor(() => expect(result.current.usesFixture).toBe(true));
  });
});
