import { defineConfig } from "vite";

const DATA_SOURCE = "https://raw.githubusercontent.com/MynosIII/TelemetryOne/main/public/data/datasets/v7_6.json";

export default defineConfig({
  base: "./",
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
