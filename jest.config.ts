import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node", // needed for Express/Mongoose
  testMatch: ["**/test/**/*.test.ts"], // test file location
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
};

export default config;
