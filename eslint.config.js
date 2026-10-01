const { defineConfig, globalIgnores } = require("eslint/config");
const tanstackQuery = require("@tanstack/eslint-plugin-query");
const prettier = require("eslint-config-prettier");
const expo = require("eslint-config-expo/flat");
const testingLibrary = require("eslint-plugin-testing-library");

// ---------------------------------------------------------------------------------------
// Reglas de arquitectura. Convierten en errores de lint lo que el README define como
// convención: la dirección de las dependencias (composition → features → shared), el uso
// del design system y el confinamiento de cada librería a su capa.
//
// `no-restricted-imports` reemplaza sus opciones en cada bloque en lugar de combinarlas, por
// eso cada bloque se arma desde estas listas indicando qué prohibiciones levanta (`allow`).
// ---------------------------------------------------------------------------------------

const NATIVE_UI = [
  "Text",
  "TextInput",
  "Pressable",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
  "TouchableNativeFeedback",
  "Button",
  "ActivityIndicator",
];

const BANNED_PATHS = {
  nativeUi: {
    name: "react-native",
    importNames: NATIVE_UI,
    message:
      "Usá los componentes del design system (@/shared/ui), no los primitivos nativos de UI.",
  },
  axios: {
    name: "axios",
    message:
      "Axios es un detalle del adaptador: usá el puerto HttpClient (@/shared/http).",
  },
  secureStore: {
    name: "expo-secure-store",
    message:
      "El almacenamiento seguro es un detalle del adaptador: usá el puerto SessionStorage.",
  },
  asyncStorage: {
    name: "@react-native-async-storage/async-storage",
    message:
      "AsyncStorage es un detalle del adaptador: usá el puerto SessionStorage.",
  },
  reactQuery: {
    name: "@tanstack/react-query",
    message:
      "TanStack Query queda confinado a *.queries.ts y use-*.ts: la UI consume un view-model.",
  },
};

const BANNED_PATTERNS = {
  composition: {
    group: ["@/composition", "@/composition/**"],
    message: "Los features no conocen la composición: ella los conoce a ellos.",
  },
  featureInternals: {
    group: ["@/features/*/*"],
    message: "Importá otros features solo por su index.ts (API pública).",
  },
  sharedInternals: {
    group: ["@/shared/http/*", "@/shared/ui/*"],
    message: "Importá shared solo por su index.ts (API pública).",
  },
  concreteAdapters: {
    group: [
      "@/features/*/*.storage",
      "@/features/*/mock-*",
      "@/features/*/*-http-client",
    ],
    message:
      "Las implementaciones concretas las instancia solo la composición.",
  },
  testing: {
    group: ["**/testing", "**/testing/**"],
    message: "Los dobles de prueba son solo para tests.",
  },
};

function restrict({
  allowPaths = [],
  allowPatterns = [],
  extraPatterns = [],
} = {}) {
  const pick = (all, allowed) =>
    Object.entries(all)
      .filter(([key]) => !allowed.includes(key))
      .map(([, value]) => value);
  return [
    "error",
    {
      paths: pick(BANNED_PATHS, allowPaths),
      patterns: [...pick(BANNED_PATTERNS, allowPatterns), ...extraPatterns],
    },
  ];
}

const TEST_FILES = ["src/**/*.test.{ts,tsx}", "src/**/testing/**"];

module.exports = defineConfig([
  globalIgnores([".expo/", "node_modules/", "dist/", "coverage/"]),
  ...expo,

  // Código de producción: todas las reglas de arquitectura.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: { "no-restricted-imports": restrict() },
  },

  // shared no depende de nada de más arriba.
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": restrict({
        allowPaths: ["nativeUi", "axios"],
        allowPatterns: ["sharedInternals", "concreteAdapters"],
        extraPatterns: [
          {
            group: ["@/features", "@/features/**"],
            message: "shared no depende de features.",
          },
        ],
      }),
    },
  },

  // Los features no se conocen entre sí (pensado para poder separarlos, como micro-frontends).
  {
    files: ["src/features/auth/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": restrict({
        extraPatterns: [
          {
            group: [
              "@/features/users",
              "@/features/users/**",
              "../users",
              "../users/**",
            ],
            message: "Un feature no importa a otro.",
          },
        ],
      }),
    },
  },
  {
    files: ["src/features/users/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": restrict({
        extraPatterns: [
          {
            group: [
              "@/features/auth",
              "@/features/auth/**",
              "../auth",
              "../auth/**",
            ],
            message: "Un feature no importa a otro.",
          },
        ],
      }),
    },
  },

  // Excepciones puntuales: cada librería vive solo en su capa.
  {
    files: ["src/features/**/*.queries.ts", "src/features/**/use-*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": restrict({ allowPaths: ["reactQuery"] }),
    },
  },
  {
    files: ["src/features/auth/secure-store-session.storage.ts"],
    rules: {
      "no-restricted-imports": restrict({
        allowPaths: ["secureStore", "asyncStorage"],
      }),
    },
  },
  {
    files: ["src/shared/http/axios-http-client.ts"],
    rules: {
      "no-restricted-imports": restrict({
        allowPaths: ["axios", "nativeUi"],
        allowPatterns: ["sharedInternals", "concreteAdapters"],
      }),
      // `import axios from "axios"` es el uso documentado de la librería.
      "import/no-named-as-default-member": "off",
    },
  },

  // Las rutas son la entrada de la app: ahí se monta la composición.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict({ allowPatterns: ["composition"] }),
    },
  },

  // La composición es el único lugar que conoce las clases concretas.
  {
    files: ["src/composition/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": restrict({
        allowPaths: ["reactQuery"],
        allowPatterns: ["composition", "concreteAdapters"],
      }),
    },
  },

  // Tests: sin restricciones de capa (importan internals y dobles a propósito).
  {
    files: TEST_FILES,
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    ...testingLibrary.configs["flat/react"],
  },

  // TanStack Query: errores típicos (queryKey incompleta, hooks desestructurados, etc.).
  ...tanstackQuery.configs["flat/recommended"],

  // Al final: apaga las reglas de estilo que chocan con Prettier.
  prettier,
]);
