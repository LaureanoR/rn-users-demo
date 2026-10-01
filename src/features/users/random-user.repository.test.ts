import { HttpError, isHttpError, type HttpClient } from "@/shared/http";

import { RandomUserRepository } from "./random-user.repository";
import { makeDto } from "./testing/fakes";

function fakeHttp(body: unknown): jest.Mocked<HttpClient> {
  return { get: jest.fn().mockResolvedValue(body) };
}

describe("RandomUserRepository", () => {
  it("pide la página con el seed del fixture y mapea los usuarios", async () => {
    const http = fakeHttp({ results: [makeDto(1), makeDto(2)] });
    const signal = new AbortController().signal;

    const page = await new RandomUserRepository(http).getPage({
      page: 3,
      signal,
    });

    expect(http.get).toHaveBeenCalledWith("/api/", {
      params: {
        seed: "demo",
        page: 3,
        results: 100,
        inc: "login,name,email,picture",
      },
      signal,
    });
    expect(page).toMatchObject({ page: 3, nextPage: 4, source: "live" });
    expect(page.users.map((user) => user.id)).toEqual(["uuid-1", "uuid-2"]);
  });

  it("la página 20 es la última", async () => {
    const page = await new RandomUserRepository(
      fakeHttp({ results: [] }),
    ).getPage({
      page: 20,
    });

    expect(page.nextPage).toBeNull();
  });

  it.each([
    ["sin results", {}],
    ["con results que no es un array", { results: "nada" }],
    ["con el error de la API", { error: "Uh oh, something has gone wrong" }],
    ["con cuerpo vacío", undefined],
    ["con un cuerpo de texto", "<html>502</html>"],
  ])("respuesta %s → HttpError de tipo http", async (_name, body) => {
    const repository = new RandomUserRepository(fakeHttp(body));

    const failure = await repository
      .getPage({ page: 1 })
      .catch((error: unknown) => error);

    expect(isHttpError(failure)).toBe(true);
    expect((failure as HttpError).kind).toBe("http");
  });

  it("propaga los errores del cliente HTTP sin tocarlos", async () => {
    const error = new HttpError("timeout", "lento");
    const http: HttpClient = { get: jest.fn().mockRejectedValue(error) };

    await expect(
      new RandomUserRepository(http).getPage({ page: 1 }),
    ).rejects.toBe(error);
  });
});
