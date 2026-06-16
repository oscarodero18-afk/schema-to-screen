import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import checker from "vite-plugin-checker";
// @ts-expect-error - No type declarations for custom plugin
import clearLogPlugin from "./dala-internal-vite-clear-log-plugin.js";

import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    clearLogPlugin(),
    react(),
    tailwindcss(),
    command === 'serve' && checker({
      typescript: true,
    }),
  ],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,
    reportCompressedSize: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-reporting': ['jspdf', 'jspdf-autotable', 'xlsx'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'recharts'],
        }
      }
    }
  },
}));
