import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Only use `await import(...)` inside an async function, so wrap plugins logic
export default defineConfig(async () => {
  const isReplit = process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined;

  return {
    root: "client", // 👈 This tells Vite your frontend lives in the `client` folder
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(isReplit
        ? [await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),       // 👈 this now points to client/src
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny:
