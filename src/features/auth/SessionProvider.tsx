import { useEffect, useReducer, type ReactNode } from "react";

import type { AuthDependencies } from "./auth.dependencies";
import { createSessionActions, restoreSession } from "./session.actions";
import { SessionActionsContext, SessionStateContext } from "./session.context";
import { initialSessionState, sessionReducer } from "./session.reducer";

interface SessionProviderProps {
  dependencies: AuthDependencies;
  children: ReactNode;
}

// Recibe sus dependencias por props y no por contexto: tiene un único consumidor.
export function SessionProvider({
  dependencies,
  children,
}: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const actions = createSessionActions(dependencies, dispatch);
  const { sessionStorage } = dependencies;

  useEffect(() => {
    void restoreSession(sessionStorage, dispatch);
  }, [sessionStorage]);

  return (
    <SessionStateContext value={state}>
      <SessionActionsContext value={actions}>{children}</SessionActionsContext>
    </SessionStateContext>
  );
}
