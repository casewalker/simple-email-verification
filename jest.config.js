module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.+(ts|js)", "**/?(*.)+(spec|test).+(ts|js)"],
  transform: {
    "^.+\\.(js|ts)$": "babel-jest",
  },
  moduleDirectories: ["node_modules", "src"],
  silent: true,
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
};
