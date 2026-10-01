import { StyleSheet, View } from "react-native";

import { Screen, Spinner, StateMessage } from "@/shared/ui";

import { useUsers, type UsersListState } from "./use-users";
import { UsersList } from "./UsersList";

export function UsersScreen() {
  const state = useUsers();

  return <Screen>{renderContent(state)}</Screen>;
}

function renderContent({
  users,
  usesFixture,
  isPending,
  isError,
  isFetchingNextPage,
  loadMore,
  restart,
}: UsersListState) {
  if (isPending) {
    return (
      <View style={styles.centered}>
        <Spinner />
      </View>
    );
  }

  // Ante un error se reemplaza la lista: así onEndReached no puede disparar reintentos en cadena.
  if (isError) {
    return (
      <StateMessage
        title="No se pudieron cargar los usuarios"
        description="Ocurrió un error inesperado."
        actionLabel="Reintentar"
        onAction={restart}
      />
    );
  }

  if (users.length === 0) {
    return <StateMessage title="No hay usuarios para mostrar" />;
  }

  return (
    <UsersList
      users={users}
      usesFixture={usesFixture}
      isFetchingNextPage={isFetchingNextPage}
      onEndReached={loadMore}
      onRestart={restart}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
