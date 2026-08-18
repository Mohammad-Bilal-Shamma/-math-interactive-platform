import { startLogin } from "@/const";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/react";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const utils = trpc.useUtils();
  const { isLoaded: authLoaded, isSignedIn } = useClerkAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { signOut, openSignIn } = useClerk();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(isSignedIn),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    await signOut();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [signOut, utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? (clerkUser ? { id: 0, name: clerkUser.fullName ?? clerkUser.firstName ?? "طالب", email: clerkUser.primaryEmailAddress?.emailAddress ?? null, role: "user" as const } : null),
      loading: !authLoaded || !userLoaded || (Boolean(isSignedIn) && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(isSignedIn),
    };
  }, [authLoaded, clerkUser, isSignedIn, meQuery.data, meQuery.error, meQuery.isLoading, userLoaded]);

  const startSignIn = useCallback(() => {
    if (!isSignedIn) openSignIn();
  }, [isSignedIn, openSignIn]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    startSignIn,
  };
}
