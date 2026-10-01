import axios, {
  AxiosError,
  CanceledError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";

import { AxiosHttpClient } from "./axios-http-client";
import { isHttpError, type HttpError } from "./http-error";

const originalAdapter = axios.defaults.adapter;
afterEach(() => {
  axios.defaults.adapter = originalAdapter;
});

/** Reemplaza el transporte de Axios: el cliente se prueba sin red, con su mapeo de errores real. */
function useAdapter(adapter: AxiosAdapter) {
  axios.defaults.adapter = adapter;
  return new AxiosHttpClient({ baseURL: "https://api.test", timeoutMs: 1000 });
}

function respond(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
) {
  return { data, status, statusText: "", headers: {}, config };
}

async function failureOf(promise: Promise<unknown>): Promise<HttpError> {
  try {
    await promise;
  } catch (error) {
    if (isHttpError(error)) {
      return error;
    }
    throw error;
  }
  throw new Error("se esperaba un rechazo");
}

describe("AxiosHttpClient", () => {
  it("devuelve el cuerpo de la respuesta", async () => {
    const client = useAdapter(async (config) =>
      respond(config, 200, { ok: true }),
    );

    expect(await client.get("/ping")).toEqual({ ok: true });
  });

  it("usa la URL base, los params y el timeout configurados", async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => respond(config, 200, {}),
    );
    const client = useAdapter(adapter);

    await client.get("/api/", { params: { page: 2 } });

    const config = adapter.mock.calls[0][0];
    expect(config.baseURL).toBe("https://api.test");
    expect(config.url).toBe("/api/");
    expect(config.params).toEqual({ page: 2 });
    expect(config.timeout).toBe(1000);
  });

  it("pasa la señal de cancelación al transporte", async () => {
    const adapter = jest.fn<ReturnType<AxiosAdapter>, Parameters<AxiosAdapter>>(
      async (config) => respond(config, 200, {}),
    );
    const controller = new AbortController();

    await useAdapter(adapter).get("/ping", { signal: controller.signal });

    expect(adapter.mock.calls[0][0].signal).toBe(controller.signal);
  });

  describe("normaliza todos los fallos a HttpError", () => {
    it("respuesta con estado de error → kind http, con status", async () => {
      const client = useAdapter(async (config) => {
        const response = respond(config, 503, "unavailable");
        throw new AxiosError(
          "fail",
          "ERR_BAD_RESPONSE",
          config,
          null,
          response,
        );
      });

      const error = await failureOf(client.get("/ping"));

      expect(error.kind).toBe("http");
      expect(error.status).toBe(503);
    });

    it.each(["ECONNABORTED", "ETIMEDOUT"])(
      "código %s → kind timeout",
      async (code) => {
        const client = useAdapter(async (config) => {
          throw new AxiosError("timeout", code, config);
        });

        const error = await failureOf(client.get("/ping"));

        expect(error.kind).toBe("timeout");
        expect(error.status).toBeUndefined();
      },
    );

    it("cancelación → kind canceled", async () => {
      const client = useAdapter(async () => {
        throw new CanceledError("canceled");
      });

      expect((await failureOf(client.get("/ping"))).kind).toBe("canceled");
    });

    it("sin respuesta (red caída) → kind network", async () => {
      const client = useAdapter(async (config) => {
        throw new AxiosError("Network Error", "ERR_NETWORK", config);
      });

      expect((await failureOf(client.get("/ping"))).kind).toBe("network");
    });

    it("un error inesperado también se normaliza a network", async () => {
      const client = useAdapter(async () => {
        throw new TypeError("algo raro");
      });

      expect((await failureOf(client.get("/ping"))).kind).toBe("network");
    });

    it("conserva el error original en cause", async () => {
      const original = new TypeError("algo raro");
      const client = useAdapter(async () => {
        throw original;
      });

      expect((await failureOf(client.get("/ping"))).cause).toBe(original);
    });
  });
});
