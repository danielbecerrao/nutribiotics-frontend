import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    fileParallelism: false,
    maxWorkers: 1,
    pool: "vmThreads",
    setupFiles: ["./src/test/setup.ts"],
  },
});
