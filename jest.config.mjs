// Jest configuration for ES modules

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx']
  ,
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  }
};
