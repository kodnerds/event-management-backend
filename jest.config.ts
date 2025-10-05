import type {Config} from 'jest'

const config:Config = {
    preset: 'ts-test',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts','js','json'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts','!src/**/*.d.ts'],
    testPathIgnorePatterns: ['/node_modules/','/dist/'],
    globalSetup: '<rootDir>/tests/setup/globalSetup.ts',
    globalTeardown: '<rootDir>tests/setup/globalTeardown.ts',
    setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts']
};

export default config;