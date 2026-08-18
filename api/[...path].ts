import app from "../dist/vercel-api.js";

/**
 * Vercel maps every /api/* request to this exact catch-all function resource.
 * The rewrite records the original path in `path`, so restore it before
 * forwarding to the bundled Express application and its `/api/trpc` mount.
 */
export default function handler(req: { url?: string }, res: unknown) {
  const requestUrl = new URL(req.url ?? "/", "http://vercel.local");
  const originalPath = requestUrl.searchParams.get("path");

  if (originalPath) {
    requestUrl.searchParams.delete("path");
    req.url = `/api/${originalPath}${requestUrl.search}`;
  }

  return app(req, res);
}
