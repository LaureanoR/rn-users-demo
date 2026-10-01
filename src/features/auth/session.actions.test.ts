import type { Session } from "./auth.model";
import { InvalidCredentialsError } from "./auth.repository";
import { createSessionActions, restoreSession } from "./session.actions";
import type { SessionAction } from "./session.reducer";
import {
  FakeAuthRepository,
  InMemorySessionStorage,
  SESSION,
} from "./testing/fakes";

const credentials = { email: "ada@example.com", password: "irrelevante" };

function setup({
  authRepository = new FakeAuthRepository(),
  sessionStorage = new InMemorySessionStorage(),
} = {}) {
  const events: string[] = [];
  const dispatched: SessionAction[] = [];
  // Qué había guardado en el instante exacto del dispatch: prueba el orden, no solo que ocurra.
  const storedAtDispatch: (Session | null)[] = [];
  const dispatch = (action: SessionAction) => {
    events.push(`dispatch:${action.type}`);
    dispatched.push(action);
    storedAtDispatch.push(sessionStorage.value);
  };
  const onSignedOut = jest.fn(() => events.push("onSignedOut"));
  const actions = createSessionActions(
    { authRepository, sessionStorage, onSignedOut },
    dispatch,
  );
  return {
    actions,
    authRepository,
    sessionStorage,
    dispatched,
    storedAtDispatch,
    events,
    onSignedOut,
  };
}

describe("restoreSession", () => {
  it("despacha la sesión guardada", async () => {
    const dispatch = jest.fn();

    await restoreSession(new InMemorySessionStorage(SESSION), dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: "restored",
      session: SESSION,
    });
  });

  it("despacha null si no hay sesión guardada", async () => {
    const dispatch = jest.fn();

    await restoreSession(new InMemorySessionStorage(), dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: "restored", session: null });
  });
});

describe("signIn", () => {
  it("autentica, persiste y recién después despacha", async () => {
    const { actions, sessionStorage, dispatched, storedAtDispatch } = setup();

    await actions.signIn(credentials);

    expect(dispatched).toEqual([{ type: "signedIn", session: SESSION }]);
    expect(storedAtDispatch).toEqual([SESSION]);
    expect(sessionStorage.calls).toEqual(["write"]);
  });

  it("con credenciales inválidas rechaza sin persistir ni despachar", async () => {
    const authRepository = new FakeAuthRepository(async () => {
      throw new InvalidCredentialsError();
    });
    const { actions, sessionStorage, dispatched } = setup({ authRepository });

    await expect(actions.signIn(credentials)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );

    expect(sessionStorage.calls).toEqual([]);
    expect(dispatched).toEqual([]);
  });

  it("si no puede persistir la sesión, falla sin despachar", async () => {
    const sessionStorage = new InMemorySessionStorage();
    sessionStorage.failOnWrite = true;
    const { actions, dispatched } = setup({ sessionStorage });

    await expect(actions.signIn(credentials)).rejects.toThrow("write failed");

    expect(dispatched).toEqual([]);
  });
});

describe("signOut", () => {
  it("borra la sesión, despacha y recién después avisa", async () => {
    const { actions, storedAtDispatch, events, onSignedOut } = setup({
      sessionStorage: new InMemorySessionStorage(SESSION),
    });

    await actions.signOut();

    expect(storedAtDispatch).toEqual([null]);
    expect(events).toEqual(["dispatch:signedOut", "onSignedOut"]);
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it("si el borrado falla, igual cierra la sesión en memoria y avisa", async () => {
    const sessionStorage = new InMemorySessionStorage(SESSION);
    sessionStorage.failOnClear = true;
    const { actions, events } = setup({ sessionStorage });

    await expect(actions.signOut()).rejects.toThrow("clear failed");

    expect(events).toEqual(["dispatch:signedOut", "onSignedOut"]);
  });
});
