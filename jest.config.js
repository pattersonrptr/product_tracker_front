module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/fileTransformer.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // This regex tells Jest to NOT ignore files in node_modules that contain "axios"
    '\\.pnp\\.[^\\/]+$'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageReporters: ['text', 'lcov'],
};
