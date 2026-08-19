# Vercel runtime debugging record

## Observed production behavior

- The deployment for commit `7a235bc` reached `Ready` but a non-destructive request to `/api/trpc/auth.me` returned `404`, proving the SPA rewrite no longer served `index.html` but the API function route still required explicit mapping.
- Vercel deployment resources confirmed one Node.js 22.x function at `/api/[...path]`.
- A direct probe of that function resource produced `FUNCTION_INVOCATION_FAILED`. Vercel runtime logs reported `ERR_MODULE_NOT_FOUND` for `/var/task/server/_core/app`, imported from `/var/task/api/[...path].js`.

## Applied repair awaiting live validation

- The `build:vercel` command now bundles `server/vercel-api.ts` with esbuild into `dist/vercel-api.js`.
- The Vercel function includes this bundle and imports it rather than directly importing a TypeScript source module.
- The rewrite forwards `/api/:path*` to the exact deployed catch-all function resource while preserving the original request path in a query parameter.
- Commit `d2d122d` contains the repair and was pushed to GitHub. Its Vercel production deployment was still building when this record was updated.

## Authoritative sources

- Vercel dashboard deployment resources and runtime logs for this project.
- Vercel rewrites documentation: https://vercel.com/docs/routing/rewrites
- Vercel functions reference: https://vercel.com/docs/functions/functions-api-reference
