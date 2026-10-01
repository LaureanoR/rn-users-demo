import { createContext, useContext } from "react";

import type { SessionActions } from "./session.actions";
import type { SessionState } from "./session.reducer";

// Dos contextos: quien solo necesita las acciones (el botón de logout, el formulario)
// no se vuelve a renderizar cuando cambia el estado.
export const SessionStateContext = createContext<SessionState | null>(null);
export const SessionActionsContext = createContext<SessionActions | null>(null);

export function useSession(): SessionState {
  const state = useContext(SessionStateContext);
  if (!state) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return state;
}

export function useSessionActions(): SessionActions {
  const actions = useContext(SessionActionsContext);
  if (!actions) {
    throw new Error("useSessionActions debe usarse dentro de SessionProvider");
  }
  return actions;
}
