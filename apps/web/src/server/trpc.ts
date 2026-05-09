import { initTRPC } from "@trpc/server";
import type { Database } from "@repo/db";

export type Context = {
  db: Database;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
