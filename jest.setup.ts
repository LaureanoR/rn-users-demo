// El `jestSetup` oficial de FlashList 2.0.2 reemplaza FlashList por una exportación que ya no
// existe (queda `undefined`). Se usa el componente real y se simulan solo las medidas de layout,
// que es lo único que Jest no puede calcular.
jest.mock("@shopify/flash-list/dist/recyclerview/utils/measureLayout", () => ({
  ...jest.requireActual(
    "@shopify/flash-list/dist/recyclerview/utils/measureLayout",
  ),
  measureParentSize: () => ({ x: 0, y: 0, width: 400, height: 900 }),
  measureFirstChildLayout: () => ({ x: 0, y: 0, width: 400, height: 900 }),
  measureItemLayout: () => ({ x: 0, y: 0, width: 400, height: 72 }),
}));

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
