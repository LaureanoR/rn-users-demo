import { screen, userEvent, waitFor } from "@testing-library/react-native";

import { InvalidCredentialsError } from "./auth.repository";
import type { Session } from "./auth.model";
import { LoginForm } from "./LoginForm";
import { FakeAuthRepository, SESSION } from "./testing/fakes";
import { renderWithSession } from "./testing/render-with-session";

const EMAIL = "ada@example.com";
const PASSWORD = "una-clave-larga";

async function renderForm(authRepository = new FakeAuthRepository()) {
  const user = userEvent.setup();
  const { dependencies, rendered } = renderWithSession(<LoginForm />, {
    authRepository,
  });
  await rendered;
  return {
    user,
    authRepository,
    dependencies,
    email: () => screen.getByLabelText("Email"),
    password: () => screen.getByLabelText("Contraseña"),
    submit: () => screen.getByRole("button", { name: "Ingresar" }),
  };
}

describe("LoginForm", () => {
  describe("validación (no llega a autenticar)", () => {
    it("campos vacíos: pide email y contraseña", async () => {
      const { user, submit, authRepository } = await renderForm();

      await user.press(submit());

      expect(await screen.findByText("Ingresá tu email.")).toBeOnTheScreen();
      expect(screen.getByText("Ingresá tu contraseña.")).toBeOnTheScreen();
      expect(authRepository.calls).toEqual([]);
    });

    it("email con formato inválido", async () => {
      const { user, email, password, submit, authRepository } =
        await renderForm();
      await user.type(email(), "no-es-un-email");
      await user.type(password(), PASSWORD);

      await user.press(submit());

      expect(
        await screen.findByText("Ingresá un email válido."),
      ).toBeOnTheScreen();
      expect(authRepository.calls).toEqual([]);
    });

    it("contraseña de menos de 8 caracteres", async () => {
      const { user, email, password, submit, authRepository } =
        await renderForm();
      await user.type(email(), EMAIL);
      await user.type(password(), "corta");

      await user.press(submit());

      expect(await screen.findByText("Mínimo 8 caracteres.")).toBeOnTheScreen();
      expect(authRepository.calls).toEqual([]);
    });
  });

  it("con datos válidos autentica con las credenciales ingresadas", async () => {
    const { user, email, password, submit, authRepository } =
      await renderForm();
    await user.type(email(), EMAIL);
    await user.type(password(), PASSWORD);

    await user.press(submit());

    expect(authRepository.calls).toEqual([
      { email: EMAIL, password: PASSWORD },
    ]);
  });

  it("la tecla Ir del teclado, desde la contraseña, envía el formulario", async () => {
    const { user, email, password, authRepository } = await renderForm();
    await user.type(email(), EMAIL);

    await user.type(password(), PASSWORD, { submitEditing: true });

    expect(authRepository.calls).toEqual([
      { email: EMAIL, password: PASSWORD },
    ]);
  });

  it("recorta los espacios del email mientras se escribe", async () => {
    const { user, email, password, submit, authRepository } =
      await renderForm();
    await user.type(email(), `  ${EMAIL} `);
    await user.type(password(), PASSWORD);

    await user.press(submit());

    expect(authRepository.calls[0].email).toBe(EMAIL);
  });

  it("credenciales incorrectas: muestra el error general y deja reintentar", async () => {
    const authRepository = new FakeAuthRepository(async () => {
      throw new InvalidCredentialsError();
    });
    const { user, email, password, submit } = await renderForm(authRepository);
    await user.type(email(), EMAIL);
    await user.type(password(), PASSWORD);

    await user.press(submit());

    expect(
      await screen.findByText("El email o la contraseña no son correctos."),
    ).toBeOnTheScreen();
    expect(submit()).toBeEnabled();
  });

  it("un fallo inesperado muestra un mensaje distinto al de credenciales", async () => {
    const authRepository = new FakeAuthRepository(async () => {
      throw new Error("boom");
    });
    const { user, email, password, submit } = await renderForm(authRepository);
    await user.type(email(), EMAIL);
    await user.type(password(), PASSWORD);

    await user.press(submit());

    expect(
      await screen.findByText("No se pudo iniciar sesión. Intentá de nuevo."),
    ).toBeOnTheScreen();
  });

  it("mientras autentica, el botón queda ocupado y no admite un segundo envío", async () => {
    let resolveSignIn: (session: Session) => void = () => {};
    const authRepository = new FakeAuthRepository(
      () => new Promise<Session>((resolve) => (resolveSignIn = resolve)),
    );
    const { user, email, password, submit } = await renderForm(authRepository);
    await user.type(email(), EMAIL);
    await user.type(password(), PASSWORD);

    await user.press(submit());
    expect(await screen.findByRole("button", { name: "Ingresar" })).toBeBusy();
    await user.press(submit());

    expect(authRepository.calls).toHaveLength(1);

    resolveSignIn(SESSION);
    await waitFor(() => expect(submit()).not.toBeBusy());
  });
});
