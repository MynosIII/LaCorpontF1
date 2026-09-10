import { defineConfig } from "vite";
import { resolve } from "node:path";

const DATA_SOURCE = "https://raw.githubusercontent.com/MynosIII/TelemetryOne/main/public/data/datasets/v7_6.json";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        audience: resolve(import.meta.dirname, "audiencia.html")
      }
    }
  },
  plugins: [{
    name: "bundle-telemetry-dataset",
    async generateBundle() {
      const response = await fetch(DATA_SOURCE);
      if (!response.ok) throw new Error(`Telemetry dataset returned ${response.status}`);
      this.emitFile({
        type: "asset",
        fileName: "data/v7_6.json",
        source: new Uint8Array(await response.arrayBuffer())
      });
    }
  }]
});
