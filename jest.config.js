module.exports = {
  preset: "jest-expo",

  testMatch: ["**/*.test.ts", "**/*.test.tsx"],

  setupFilesAfterEnv: ["./test/setup-tests.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  transformIgnorePatterns: [
    "node_modules/@hangar",
    "node_modules/(?!(react-native|@react-native|expo|@expo|expo-modules-core|react-redux|@reduxjs/toolkit|immer)/)",
  ],
  collectCoverageFrom: [
    "application/**/*.{ts,tsx}",
    "infrastructure/**/*.{ts,tsx}",
    "presentation/controllers/**/*.{ts,tsx}",
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
