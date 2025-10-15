export default {
  globalSetup: './test/setup/jest-setup.ts',
  globalTeardown: './test/setup/jest-teardown.ts',
  coveragePathIgnorePatterns: ['.config.js'],
  preset: 'ts-jest',
  testTimeout: process.env.CI ? 120_000 : 12_000,
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  testPathIgnorePatterns: ['/e2e/', '/node_modules/', '/dist/'],
  ...(process.env.CI && { maxWorkers: 1 })
};
