import { render, screen, userEvent } from "@testing-library/react-native";

import { Button } from "./Button";

describe("Button", () => {
  it("llama a onPress al tocarlo", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Ingresar" onPress={onPress} />);

    await user.press(screen.getByRole("button", { name: "Ingresar" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("deshabilitado no responde al toque", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Ingresar" onPress={onPress} disabled />);

    const button = screen.getByRole("button", { name: "Ingresar" });
    await user.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it("cargando se anuncia ocupado, no responde y reemplaza el texto por un indicador", async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button label="Ingresar" onPress={onPress} loading />);

    const button = screen.getByRole("button", { name: "Ingresar" });
    await user.press(button);

    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.queryByText("Ingresar")).not.toBeOnTheScreen();
  });
});
