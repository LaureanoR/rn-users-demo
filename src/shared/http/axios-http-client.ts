import axios, { type AxiosInstance } from "axios";

import type { HttpClient, HttpGetOptions } from "./http-client";
import { HttpError } from "./http-error";

export interface AxiosHttpClientConfig {
  baseURL: string;
  timeoutMs: number;
}

export class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;

  constructor({ baseURL, timeoutMs }: AxiosHttpClientConfig) {
    this.instance = axios.create({
      baseURL,
      timeout: timeoutMs,
      headers: { Accept: "application/json" },
    });
  }

  async get<T>(
    url: string,
    { params, signal }: HttpGetOptions = {},
  ): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, { params, signal });
      return response.data;
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown): HttpError {
  if (axios.isCancel(error)) {
    return new HttpError("canceled", "La solicitud fue cancelada", {
      cause: error,
    });
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status } = error.response;
      return new HttpError(
        "http",
        `El servidor respondió con estado ${status}`,
        {
          status,
          cause: error,
        },
      );
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new HttpError(
        "timeout",
        "La solicitud superó el tiempo de espera",
        { cause: error },
      );
    }
  }

  return new HttpError("network", "No se pudo completar la solicitud", {
    cause: error,
  });
}
