import { createApp } from "../server/_core/app";

/**
 * Vercel serves this default-exported Express application as a Node.js
 * Function for every /api/* request, including tRPC and OAuth callbacks.
 */
const app = createApp();

export default app;
