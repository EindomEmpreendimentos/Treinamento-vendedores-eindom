import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, 
    host: true,       
  },
  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@contextos": path.resolve(__dirname, "./src/contextos"),
      "@comp": path.resolve(__dirname, "./src/componentes"),
      "@routes": path.resolve(__dirname, "./src/routes"),
    },
  },
});
