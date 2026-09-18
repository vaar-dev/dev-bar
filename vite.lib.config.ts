import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Builds the publishable library from src/lib, separate from the demo app
// served by vite.config.ts. Run with `npm run build`.
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      include: ["src/lib"],
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
    lib: {
      entry: "src/lib/index.ts",
      formats: ["es"],
      fileName: () => "dev-bar.js",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
