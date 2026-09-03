import { appRouter } from "@/server";
import { createDb } from "@/server/db";
import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { env } from "cloudflare:workers";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      db: createDb(env),
      cache:
        process.env.NODE_ENV === "development" ? undefined : env.DB_QUERY_CACHE,
    }),
  });
};

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
