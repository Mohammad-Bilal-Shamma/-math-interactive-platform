import { createApp } from "./_core/app";

// Built with esbuild during `pnpm build:vercel` so Vercel receives one
// self-contained module for the Express/tRPC runtime and all local imports.
export default createApp();
