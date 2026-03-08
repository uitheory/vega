import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    test: "src/test.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
})
