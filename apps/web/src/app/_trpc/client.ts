import type { AppRouter } from "@/server";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { envClient } from "@repo/env/client";

export const queryClient = new QueryClient();

let [host, protcol] = ["", ""];
if (typeof window !== "undefined") {
  protcol = window.location.protocol;
  host = window.location.host;
}
const baseUrl =
  !protcol || !host ? envClient.NEXT_PUBLIC_BASE_URL : `${protcol}//${host}`;

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: `${baseUrl}/api/trpc` })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
