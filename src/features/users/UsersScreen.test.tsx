import { screen, userEvent } from "@testing-library/react-native";

import {
  FakeUsersRepository,
  makeSinglePage,
  networkError,
} from "./testing/fakes";
import { renderWithUsers } from "./testing/render-with-users";
import type { UsersPage } from "./users.repository";
import { UsersScreen } from "./UsersScreen";

const NOTICE =
  "Mostrando datos de ejemplo porque no se pudo conectar con el servicio.";
const never = () => new Promise<UsersPage>(() => {});

describe("UsersScreen", () => {
  it("mientras carga la primera página muestra un indicador", async () => {
    await renderWithUsers(<UsersScreen />, new FakeUsersRepository(never))
      .rendered;

    const spinner = screen.getByLabelText("Cargando");
    expect(spinner).toHaveProp("accessibilityRole", "progressbar");
  });

  it("muestra los usuarios y cuántos hay cargados", async () => {
    await renderWithUsers(
      <UsersScreen />,
      new FakeUsersRepository(async ({ page }) => makeSinglePage(page)),
    ).rendered;

    expect(await screen.findByText("Nombre1 Apellido1")).toBeOnTheScreen();
    expect(screen.getByText("user1@example.com")).toBeOnTheScreen();
    expect(screen.getByText("Mostrando 1 de 2000 usuarios")).toBeOnTheScreen();
    expect(screen.queryByText(NOTICE)).not.toBeOnTheScreen();
  });

  it("cada fila se anuncia como un solo elemento con nombre y email", async () => {
    await renderWithUsers(
      <UsersScreen />,
      new FakeUsersRepository(async ({ page }) => makeSinglePage(page)),
    ).rendered;

    expect(
      await screen.findByLabelText("Nombre1 Apellido1, user1@example.com"),
    ).toBeOnTheScreen();
  });

  it("con datos de ejemplo avisa y 'Reintentar' vuelve a pedir solo la primera página", async () => {
    const user = userEvent.setup();
    const repository = new FakeUsersRepository(async ({ page }) =>
      makeSinglePage(page, "fixture"),
    );
    await renderWithUsers(<UsersScreen />, repository).rendered;

    expect(await screen.findByText(NOTICE)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Nombre1 Apellido1")).toBeOnTheScreen();
    expect(repository.calls.map((call) => call.page)).toEqual([1, 1]);
  });

  it("si el servicio se recupera, 'Reintentar' quita el aviso", async () => {
    const user = userEvent.setup();
    let source: UsersPage["source"] = "fixture";
    const repository = new FakeUsersRepository(async ({ page }) =>
      makeSinglePage(page, source),
    );
    await renderWithUsers(<UsersScreen />, repository).rendered;
    await screen.findByText(NOTICE);

    source = "live";
    await user.press(screen.getByRole("button", { name: "Reintentar" }));

    expect(
      await screen.findByText("Mostrando 1 de 2000 usuarios"),
    ).toBeOnTheScreen();
    expect(screen.queryByText(NOTICE)).not.toBeOnTheScreen();
  });

  it("ante un error reemplaza la lista por un mensaje y permite reintentar", async () => {
    const user = userEvent.setup();
    let failing = true;
    const repository = new FakeUsersRepository(async ({ page }) => {
      if (failing) {
        throw networkError();
      }
      return makeSinglePage(page);
    });
    await renderWithUsers(<UsersScreen />, repository).rendered;

    expect(
      await screen.findByText("No se pudieron cargar los usuarios"),
    ).toBeOnTheScreen();
    expect(repository.calls).toHaveLength(1);

    failing = false;
    await user.press(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Nombre1 Apellido1")).toBeOnTheScreen();
    expect(
      screen.queryByText("No se pudieron cargar los usuarios"),
    ).not.toBeOnTheScreen();
  });

  it("sin usuarios muestra un estado vacío", async () => {
    const repository = new FakeUsersRepository(async (params) => ({
      ...makeSinglePage(params.page),
      users: [],
    }));
    await renderWithUsers(<UsersScreen />, repository).rendered;

    expect(
      await screen.findByText("No hay usuarios para mostrar"),
    ).toBeOnTheScreen();
  });
});
