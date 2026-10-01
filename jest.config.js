/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  // Los tests viven junto al código que prueban: src/features/auth/session.reducer.test.ts
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  // Metro resuelve el alias "@/" con el tsconfig; Jest necesita que se lo digan.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/testing/**",
    "!src/**/index.ts",
    "!src/app/**",
  ],
  clearMocks: true,
};
