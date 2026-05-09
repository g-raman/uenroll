import type { AppRouter } from "@/server";
import { envClient } from "@repo/env/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

const getTRPCUrl = () => {
  if (typeof window !== "undefined") {
    return "/api/trpc";
  }

  return `${envClient.VITE_BASE_URL}/api/trpc`;
};

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        url: getTRPCUrl(),
      }),
    ],
  }),
  queryClient,
});

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    context: {
      queryClient,
      trpc,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    Wrap: function QueryClientWrap({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
