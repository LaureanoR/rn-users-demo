import { screen } from "@testing-library/react-native";

import { LoginScreen } from "./LoginScreen";
import { renderWithSession } from "./testing/render-with-session";

describe("LoginScreen", () => {
  it("muestra el título, la indicación y el formulario", async () => {
    await renderWithSession(<LoginScreen />).rendered;

    expect(screen.getByText("Iniciar sesión")).toBeOnTheScreen();
    expect(screen.getByText(/usuario demo/)).toBeOnTheScreen();
    expect(screen.getByLabelText("Email")).toBeOnTheScreen();
    expect(screen.getByLabelText("Contraseña")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeOnTheScreen();
  });
});
