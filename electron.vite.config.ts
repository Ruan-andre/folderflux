import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

const rootDir = __dirname;

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "~": resolve(rootDir, "src"),
        "@": resolve(rootDir, "src"),
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          { src: "src/db/**/*", dest: "db/" },
          { src: "src/shared/**/*", dest: "shared/" },
          { src: "dev-app-update.yml", dest: "." },
        ],
      }),
    ],
    build: {
      rollupOptions: {
        input: {
          index: resolve(rootDir, "src/main/index.ts"),
          taskWorker: resolve(rootDir, "src/main/workers/taskWorker.ts"),
        },
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "~": resolve(rootDir, "src"),
        "@": resolve(rootDir, "src"),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "~": resolve(rootDir, "src"),
        "@": resolve(rootDir, "src"),
        "@renderer": resolve(rootDir, "src/renderer/src"),
      },
    },
    plugins: [react()],
    publicDir: resolve(rootDir, "public"),
  },
});
