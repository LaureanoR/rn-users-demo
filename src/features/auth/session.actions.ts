import type { Dispatch } from "react";

import type { AuthDependencies } from "./auth.dependencies";
import type { Credentials } from "./auth.model";
import type { SessionAction } from "./session.reducer";
import type { SessionStorage } from "./session.storage";

export interface SessionActions {
  signIn(credentials: Credentials): Promise<void>;
  signOut(): Promise<void>;
}

export async function restoreSession(
  sessionStorage: SessionStorage,
  dispatch: Dispatch<SessionAction>,
): Promise<void> {
  dispatch({ type: "restored", session: await sessionStorage.read() });
}

export function createSessionActions(
  { authRepository, sessionStorage, onSignedOut }: AuthDependencies,
  dispatch: Dispatch<SessionAction>,
): SessionActions {
  return {
    async signIn(credentials) {
      const session = await authRepository.signIn(credentials);
      // Si no se puede persistir, el inicio de sesión falla: entrar sin persistencia daría
      // una sesión que desaparece sin explicación al reabrir la app.
      await sessionStorage.write(session);
      dispatch({ type: "signedIn", session });
    },

    async signOut() {
      try {
        await sessionStorage.clear();
      } finally {
        // Aunque el borrado falle, la sesión en memoria se cierra igual.
        dispatch({ type: "signedOut" });
        onSignedOut?.();
      }
    },
  };
}
