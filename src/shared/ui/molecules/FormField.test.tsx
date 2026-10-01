import { render, screen, userEvent } from "@testing-library/react-native";

import { FormField } from "./FormField";

describe("FormField", () => {
  it("asocia la etiqueta al campo y propaga el texto escrito", async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    await render(
      <FormField label="Email" value="" onChangeText={onChangeText} />,
    );

    await user.type(screen.getByLabelText("Email"), "a");

    expect(onChangeText).toHaveBeenCalledWith("a");
  });

  it("sin error no muestra mensaje", async () => {
    await render(<FormField label="Email" value="" />);

    expect(
      screen.getByLabelText("Email").props.accessibilityHint,
    ).toBeUndefined();
  });

  it("con error lo muestra y lo expone como pista de accesibilidad del campo", async () => {
    await render(
      <FormField label="Email" value="" error="Ingresá tu email." />,
    );

    expect(screen.getByText("Ingresá tu email.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Email")).toHaveProp(
      "accessibilityHint",
      "Ingresá tu email.",
    );
  });
});
