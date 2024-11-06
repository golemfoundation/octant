/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '.(css|scss)$': '<rootDir>/src/mocks/jest/styleMock.js',
    '.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/mocks/jest/fileMock.js',
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./setupTests.js'],
  testEnvironment: 'jsdom',
};
