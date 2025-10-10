import { defineConfig } from "vite";

export default defineConfig({
  root: ".",                 // project root (where index.html is)
  server: {
    port: 5123,
  },
  build: {
    outDir: "public",        // Vite will emit prod files here
    emptyOutDir: true        // clean between builds
  }
});
