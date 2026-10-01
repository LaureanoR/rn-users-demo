import type { Session } from "./auth.model";
import {
  initialSessionState,
  sessionReducer,
  type SessionState,
} from "./session.reducer";

const session: Session = {
  token: "token",
  user: { id: "1", name: "Ada", email: "ada@example.com" },
};

describe("sessionReducer", () => {
  it("arranca en loading hasta saber si hay una sesión guardada", () => {
    expect(initialSessionState).toEqual({ status: "loading" });
  });

  describe("restored", () => {
    it("autentica si había una sesión guardada", () => {
      expect(
        sessionReducer(initialSessionState, { type: "restored", session }),
      ).toEqual({ status: "authenticated", session });
    });

    it("pasa a no autenticado si no había sesión", () => {
      expect(
        sessionReducer(initialSessionState, {
          type: "restored",
          session: null,
        }),
      ).toEqual({ status: "unauthenticated" });
    });

    it("ignora una restauración tardía si el usuario ya inició sesión", () => {
      const signedIn: SessionState = { status: "authenticated", session };

      expect(
        sessionReducer(signedIn, { type: "restored", session: null }),
      ).toBe(signedIn);
    });

    it("ignora una restauración tardía si el usuario ya cerró sesión", () => {
      const signedOut: SessionState = { status: "unauthenticated" };

      expect(sessionReducer(signedOut, { type: "restored", session })).toBe(
        signedOut,
      );
    });
  });

  it("signedIn autentica desde cualquier estado", () => {
    expect(
      sessionReducer(
        { status: "unauthenticated" },
        { type: "signedIn", session },
      ),
    ).toEqual({ status: "authenticated", session });
  });

  it("signedOut deja al usuario sin autenticar", () => {
    expect(
      sessionReducer(
        { status: "authenticated", session },
        { type: "signedOut" },
      ),
    ).toEqual({ status: "unauthenticated" });
  });
});
