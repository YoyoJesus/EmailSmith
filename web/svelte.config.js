import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // Prerendered pages receive this policy as a <meta> tag with hashes for SvelteKit's inline bootstrap script.
    // frame-ancestors is ignored in <meta>, so vercel.json sends it as a header.
    csp: {
      mode: "hash",
      directives: {
        "default-src": ["self"],
        "script-src": ["self"],
        "style-src": ["self", "unsafe-inline"],
        "img-src": ["self", "data:", "https:"],
        "font-src": ["self"],
        "connect-src": ["self"],
        "object-src": ["none"],
        "base-uri": ["self"],
        "form-action": ["self"],
      },
    },
  },
};

export default config;
