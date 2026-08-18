import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getAuth } from "@clerk/express";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const auth = getAuth(opts.req);
    if (auth.isAuthenticated && auth.userId) {
      await db.upsertUser({
        openId: auth.userId,
        loginMethod: "clerk",
        lastSignedIn: new Date(),
      });
      user = (await db.getUserByOpenId(auth.userId)) ?? null;
    }
  } catch (error) {
    // Clerk auth is optional for public procedures and local catalog preview.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
