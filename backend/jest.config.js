module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // On indique à Jest de chercher dans les deux dossiers
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  // On transforme les fichiers .ts avec ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // On aide Jest à trouver tes fichiers sources depuis le dossier test
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // On ignore les dossiers qui ne contiennent pas de logique métier
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/types/",
    "/src/config/"
  ]
};