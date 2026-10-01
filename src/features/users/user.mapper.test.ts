import { toUser } from "./user.mapper";
import { makeDto } from "./testing/fakes";

describe("toUser", () => {
  it("traduce el DTO de la API al modelo de dominio", () => {
    expect(toUser(makeDto(7))).toEqual({
      id: "uuid-7",
      fullName: "Nombre7 Apellido7",
      email: "user7@example.com",
      avatarUrl: "https://img.test/large/7.jpg",
    });
  });
});
