import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: [
        "node_modules",
        "dist",
        "**/*.test.ts",
        "src/infrastructure/database/migrations/**",
        "src/index.ts",
      ],
    },
  },
})
