import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({ dir: "./" })

const config: Config = {
  coverageProvider: "v8",
  testEnvironment:  "jsdom",
  setupFiles:       ["<rootDir>/jest.setup.ts"],
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
  ],
  coverageThreshold: {
    global: {
      branches:   75,
      functions:  75,
      lines:      75,
      statements: 75,
    },
  },
}

export default createJestConfig(config)
