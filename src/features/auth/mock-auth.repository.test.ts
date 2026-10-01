import { isInvalidCredentialsError } from "./auth.repository";
import { DEMO_CREDENTIALS, DEMO_USER } from "./demo-user";
import { MockAuthRepository } from "./mock-auth.repository";

describe("MockAuthRepository", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  async function signIn(email: string, password: string) {
    const result = new MockAuthRepository().signIn({ email, password });
    // Se adjunta el catch antes de avanzar el reloj para que el rechazo nunca quede sin manejar.
    const settled = result.then(
      (session) => ({ session }),
      (error: unknown) => ({ error }),
    );
    await jest.advanceTimersByTimeAsync(800);
    return settled;
  }

  it("devuelve la sesión del usuario demo con sus credenciales", async () => {
    const outcome = await signIn(
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password,
    );

    expect(outcome).toEqual({
      session: { token: expect.any(String), user: DEMO_USER },
    });
  });

  it("ignora mayúsculas y espacios alrededor del email", async () => {
    const outcome = await signIn(
      `  ${DEMO_CREDENTIALS.email.toUpperCase()} `,
      DEMO_CREDENTIALS.password,
    );

    expect(outcome).toHaveProperty("session");
  });

  it("rechaza una contraseña incorrecta con InvalidCredentialsError", async () => {
    const outcome = await signIn(DEMO_CREDENTIALS.email, "otra-contraseña");

    expect(
      isInvalidCredentialsError((outcome as { error: unknown }).error),
    ).toBe(true);
  });

  it("rechaza un email desconocido", async () => {
    const outcome = await signIn("otro@example.com", DEMO_CREDENTIALS.password);

    expect(outcome).toHaveProperty("error");
  });

  it("la contraseña distingue mayúsculas", async () => {
    const outcome = await signIn(
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password.toUpperCase(),
    );

    expect(outcome).toHaveProperty("error");
  });

  it("simula la latencia de red: no resuelve antes de tiempo", async () => {
    const promise = new MockAuthRepository().signIn(DEMO_CREDENTIALS);
    let resolved = false;
    void promise.then(() => (resolved = true));

    await jest.advanceTimersByTimeAsync(799);
    expect(resolved).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });
});
