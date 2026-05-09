import type { AppRouter } from "@/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter as createTanStackRouter,
  useRouteContext,
} from "@tanstack/react-router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();
  const trpc = createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient({
      links: [httpBatchLink({ url: "/api/trpc" })],
    }),
    queryClient,
  });

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

export function useTRPC() {
  return useRouteContext({ from: "__root__", select: context => context.trpc });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
