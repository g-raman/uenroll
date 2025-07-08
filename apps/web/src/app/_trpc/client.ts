import type { AppRouter } from "@/server";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const queryClient = new QueryClient();
const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/api/trpc" })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
