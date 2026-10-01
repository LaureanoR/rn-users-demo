import { getNextPage, USERS_PAGE_SIZE, USERS_TOTAL } from "./users.config";

describe("getNextPage", () => {
  it("avanza de a una página", () => {
    expect(getNextPage(1)).toBe(2);
    expect(getNextPage(10)).toBe(11);
  });

  it("la última página no tiene siguiente (la API no informa un total)", () => {
    const lastPage = USERS_TOTAL / USERS_PAGE_SIZE;

    expect(getNextPage(lastPage - 1)).toBe(lastPage);
    expect(getNextPage(lastPage)).toBeNull();
  });
});
