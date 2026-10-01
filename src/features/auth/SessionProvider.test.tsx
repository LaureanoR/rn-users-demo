import { render, screen, userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

import { SignOutButton } from "./SignOutButton";
import { useSession, useSessionActions } from "./session.context";
import { InMemorySessionStorage, SESSION } from "./testing/fakes";
import { renderWithSession } from "./testing/render-with-session";

/** Muestra el estado de sesión como texto y expone las acciones como botones de prueba. */
function Probe() {
  const state = useSession();
  const { signIn } = useSessionActions();
  return (
    <>
      <Text>{`status:${state.status}`}</Text>
      {state.status === "authenticated" ? (
        <Text>{`user:${state.session.user.name}`}</Text>
      ) : null}
      <Text
        onPress={() => void signIn({ email: "a@b.co", password: "12345678" })}
      >
        entrar
      </Text>
      <SignOutButton />
    </>
  );
}

describe("SessionProvider", () => {
  it("restaura la sesión guardada al arrancar", async () => {
    await renderWithSession(<Probe />, {
      sessionStorage: new InMemorySessionStorage(SESSION),
    }).rendered;

    expect(await screen.findByText("status:authenticated")).toBeOnTheScreen();
    expect(screen.getByText(`user:${SESSION.user.name}`)).toBeOnTheScreen();
  });

  it("sin sesión guardada queda sin autenticar", async () => {
    await renderWithSession(<Probe />).rendered;

    expect(await screen.findByText("status:unauthenticated")).toBeOnTheScreen();
  });

  it("signIn autentica y persiste la sesión", async () => {
    const user = userEvent.setup();
    const { dependencies, rendered } = renderWithSession(<Probe />);
    await rendered;
    await screen.findByText("status:unauthenticated");

    await user.press(screen.getByText("entrar"));

    expect(await screen.findByText("status:authenticated")).toBeOnTheScreen();
    expect(
      (dependencies.sessionStorage as InMemorySessionStorage).value,
    ).toEqual(SESSION);
  });

  it("signOut borra la sesión guardada, desautentica y avisa a la composición", async () => {
    const user = userEvent.setup();
    const sessionStorage = new InMemorySessionStorage(SESSION);
    const onSignedOut = jest.fn();
    await renderWithSession(<Probe />, { sessionStorage, onSignedOut })
      .rendered;
    await screen.findByText("status:authenticated");

    await user.press(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(await screen.findByText("status:unauthenticated")).toBeOnTheScreen();
    expect(sessionStorage.value).toBeNull();
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it("usar los hooks fuera del provider falla con un mensaje claro", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(render(<Probe />)).rejects.toThrow(
      "useSession debe usarse dentro de SessionProvider",
    );
  });
});
