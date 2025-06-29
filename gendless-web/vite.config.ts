import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { cloudflare } from "@cloudflare/vite-plugin";
import { createViteLicensePlugin } from "rollup-license-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cloudflare(),
    createViteLicensePlugin({
      excludedPackageTest: (packageName) => {
        return packageName.startsWith("gendless");
      },
    }),
  ],
});
