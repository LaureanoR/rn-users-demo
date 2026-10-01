import { HttpError, type HttpClient } from "@/shared/http";

import type { RandomUserResponse } from "./random-user.dto";
import { toUser } from "./user.mapper";
import { getNextPage, USERS_PAGE_SIZE } from "./users.config";
import type {
  GetUsersPageParams,
  UsersPage,
  UsersRepository,
} from "./users.repository";

const API_PATH = "/api/";
// users.fixture.json se generó con este seed y estos campos: si cambian, hay que regenerarlo.
const SEED = "demo";
const FIELDS = "login,name,email,picture";

export class RandomUserRepository implements UsersRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getPage({ page, signal }: GetUsersPageParams): Promise<UsersPage> {
    const body = await this.http.get<RandomUserResponse>(API_PATH, {
      params: { seed: SEED, page, results: USERS_PAGE_SIZE, inc: FIELDS },
      signal,
    });

    if (!Array.isArray(body?.results)) {
      throw new HttpError("http", "randomuser.me respondió sin resultados", {
        cause: body?.error,
      });
    }

    return {
      users: body.results.map(toUser),
      page,
      nextPage: getNextPage(page),
      source: "live",
    };
  }
}
