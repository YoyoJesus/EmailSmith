import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  // Component tests mount Svelte in jsdom, which needs the browser build of Svelte.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
});
