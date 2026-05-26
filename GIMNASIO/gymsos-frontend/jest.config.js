const nextJest = require("next/jest.js")

const createJestConfig = nextJest({ dir: "./" })

/** @type {import("jest").Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment:  "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.{ts,tsx}",
    "**/*.{test,spec}.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/lib/services/**/*.ts",
    "src/hooks/**/*.ts",
    "src/lib/auth.ts",
    "!src/**/*.d.ts",
    "!src/lib/services/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches:   55,  // service data-mapping branches need real DB data to hit
      functions:  75,
      lines:      75,
      statements: 75,
    },
  },
}

module.exports = createJestConfig(config)
