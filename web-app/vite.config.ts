import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { cloudflare } from "@cloudflare/vite-plugin";
import { createViteLicensePlugin } from "rollup-license-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    cloudflare({
      configPath: "./wrangler.jsonc",
      experimental: { remoteBindings: true },
    }),
    createViteLicensePlugin({
      excludedPackageTest: (packageName) => {
        return packageName.startsWith("gendless");
      },
    }),
  ],
  define: {
    "process.env": {
    },
  }
});
