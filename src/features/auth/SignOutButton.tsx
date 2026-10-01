import { Button } from "@/shared/ui";

import { useSessionActions } from "./session.context";

export function SignOutButton() {
  const { signOut } = useSessionActions();

  return (
    <Button
      label="Cerrar sesión"
      variant="ghost"
      onPress={() => void signOut()}
    />
  );
}
