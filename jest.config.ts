import { JestConfigWithTsJest as JestConfig } from 'ts-jest';

const config: JestConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {},
    transformIgnorePatterns: [],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '^@compilation/(.*)$': '<rootDir>/src/compilation/$1',
    }
}
  
export default config;