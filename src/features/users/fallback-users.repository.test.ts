import { HttpError } from "@/shared/http";

import { FallbackUsersRepository } from "./fallback-users.repository";
import { FakeUsersRepository, makePage } from "./testing/fakes";

const failingWith = (error: unknown) =>
  new FakeUsersRepository(async () => {
    throw error;
  });

describe("FallbackUsersRepository", () => {
  it("si el primario responde, no toca el fallback", async () => {
    const primary = new FakeUsersRepository();
    const fallback = new FakeUsersRepository(async ({ page }) =>
      makePage(page, "fixture"),
    );

    const page = await new FallbackUsersRepository(primary, fallback).getPage({
      page: 1,
    });

    expect(page.source).toBe("live");
    expect(fallback.calls).toEqual([]);
  });

  it.each([
    ["network", new HttpError("network", "x")],
    ["timeout", new HttpError("timeout", "x")],
    ["http", new HttpError("http", "x", { status: 500 })],
  ])(
    "ante un HttpError %s recurre al fallback con los mismos parámetros",
    async (_kind, error) => {
      const fallback = new FakeUsersRepository(async ({ page }) =>
        makePage(page, "fixture"),
      );
      const params = { page: 2, signal: new AbortController().signal };

      const page = await new FallbackUsersRepository(
        failingWith(error),
        fallback,
      ).getPage(params);

      expect(page.source).toBe("fixture");
      expect(fallback.calls).toEqual([params]);
    },
  );

  it("no intercepta las cancelaciones: son intencionales", async () => {
    const canceled = new HttpError("canceled", "x");
    const fallback = new FakeUsersRepository();

    await expect(
      new FallbackUsersRepository(failingWith(canceled), fallback).getPage({
        page: 1,
      }),
    ).rejects.toBe(canceled);
    expect(fallback.calls).toEqual([]);
  });

  it("no tapa los bugs propios: un error que no es HttpError se propaga", async () => {
    const bug = new TypeError("undefined is not a function");
    const fallback = new FakeUsersRepository();

    await expect(
      new FallbackUsersRepository(failingWith(bug), fallback).getPage({
        page: 1,
      }),
    ).rejects.toBe(bug);
    expect(fallback.calls).toEqual([]);
  });

  it("si el fallback también falla, propaga ese error", async () => {
    const error = new Error("fixture roto");

    await expect(
      new FallbackUsersRepository(
        failingWith(new HttpError("network", "x")),
        failingWith(error),
      ).getPage({ page: 1 }),
    ).rejects.toBe(error);
  });
});
