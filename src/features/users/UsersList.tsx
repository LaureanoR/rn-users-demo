import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";

import { Banner, Spinner, Text, useTheme } from "@/shared/ui";

import type { User } from "./user.model";
import { UserRow } from "./UserRow";
import { USERS_TOTAL } from "./users.config";

interface UsersListProps {
  users: User[];
  usesFixture: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  onRestart: () => void;
}

export function UsersList({
  users,
  usesFixture,
  isFetchingNextPage,
  onEndReached,
  onRestart,
}: UsersListProps) {
  const { spacing } = useTheme();

  return (
    <FlashList
      data={users}
      renderItem={({ item }) => <UserRow user={item} />}
      keyExtractor={(user) => user.id}
      onEndReached={onEndReached}
      // Pide la página siguiente con ~1,5 pantallas de margen, antes de llegar al final.
      onEndReachedThreshold={1.5}
      ListHeaderComponent={
        <Header
          loaded={users.length}
          usesFixture={usesFixture}
          onRestart={onRestart}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ padding: spacing.lg }}>
            <Spinner size="small" label="Cargando más usuarios" />
          </View>
        ) : null
      }
    />
  );
}

interface HeaderProps {
  loaded: number;
  usesFixture: boolean;
  onRestart: () => void;
}

function Header({ loaded, usesFixture, onRestart }: HeaderProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      {usesFixture ? (
        <Banner
          message="Mostrando datos de ejemplo porque no se pudo conectar con el servicio."
          actionLabel="Reintentar"
          onAction={onRestart}
        />
      ) : null}
      <Text variant="caption" tone="muted">
        {`Mostrando ${loaded} de ${USERS_TOTAL} usuarios`}
      </Text>
    </View>
  );
}
