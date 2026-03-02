module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/Tests/**/*.test.js'],
  collectCoverageFrom: [
    'Frontend/**/*.js',
    'Backend/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/Tests/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/Tests/setup.js'],
  testTimeout: 10000
};
