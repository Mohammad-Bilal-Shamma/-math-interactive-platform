import { trpc } from "@/lib/trpc";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { useMemo } from "react";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import { initializeAnalytics } from "./lib/analytics";
import "./index.css";

initializeAnalytics();

const queryClient = new QueryClient();

function ClerkTrpcProvider() {
  const { getToken } = useClerkAuth();
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: "/api/trpc",
            transformer: superjson,
            headers: async () => {
              const token = await getToken();
              return token ? { Authorization: `Bearer ${token}` } : {};
            },
            fetch(input, init) {
              return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
            },
          }),
        ],
      }),
    [getToken],
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
    </trpc.Provider>
  );
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  publishableKey ? (
    <ClerkProvider publishableKey={publishableKey} signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
      <ClerkTrpcProvider />
    </ClerkProvider>
  ) : (
    <div>يتطلب تسجيل الدخول ضبط VITE_CLERK_PUBLISHABLE_KEY.</div>
  ),
);
