import type { Session } from "./auth.model";

export type SessionState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; session: Session };

export type SessionAction =
  | { type: "restored"; session: Session | null }
  | { type: "signedIn"; session: Session }
  | { type: "signedOut" };

export const initialSessionState: SessionState = { status: "loading" };

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "restored":
      // Una restauración tardía nunca pisa un estado más nuevo.
      if (state.status !== "loading") {
        return state;
      }
      return action.session
        ? { status: "authenticated", session: action.session }
        : { status: "unauthenticated" };
    case "signedIn":
      return { status: "authenticated", session: action.session };
    case "signedOut":
      return { status: "unauthenticated" };
  }
}
