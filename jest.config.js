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
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}', // Exclui arquivos de teste
    '!src/index.js', // Exclui o arquivo de entrada principal
    '!src/reportWebVitals.js', // Exclui o arquivo reportWebVitals
    '!src/fileTransformer.js',
    '!src/setupTests.js'
  ],
  coverageReporters: ['text', 'lcov'], // Formatos de relatório
  globals: {
    __ROUTER_FUTURES__: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
};
