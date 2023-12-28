import { JestConfigWithTsJest as JestConfig } from 'ts-jest';

const config: JestConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {},
    transformIgnorePatterns: [],
    moduleDirectories: ['node_modules', 'src']
}
  
export default config;