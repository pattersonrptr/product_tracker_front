module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/fileTransformer.js',
    '\\.(css|scss|sass)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // This regex tells Jest to NOT ignore files in node_modules that contain "axios"
    '\\.pnp\\.[^\\/]+$'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',       // Include files ending with .js and .jsx
    '!src/**/*.test.{js,jsx}', // Exclude test files
    '!src/index.js',           // Exclude the entry file
    '!src/reportWebVitals.js', // Exclude file reportWebVitals
    '!src/fileTransformer.js', // Exclude file fileTransformer
    '!src/setupTests.js'       // Exclude setupTests.js
  ],
  coverageReporters: ['text', 'lcov'], // Formatos de relatório
  globals: {
    __ROUTER_FUTURES__: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
};
