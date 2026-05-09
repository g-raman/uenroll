import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { AppRouter } from "@/server";
import { Toaster } from "@repo/ui/components/sonner";
import { envClient } from "@repo/env/client";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { Suspense } from "react";
import { PostHogInit } from "@/components/PostHogInit";
import appCss from "./app.css?url";
import shadcnCss from "@repo/ui/shadcn.css?url";

export interface RouterAppContext {
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<AppRouter>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
      { title: "uEnroll" },
      {
        name: "description",
        content: "A modern schedule builder for uOttawa students",
      },
      {
        name: "keywords",
        content:
          "uenroll, uschedule, uozone, uottawa, university of ottawa, schedule builder, uottawa schedule builder, uottawa schedule maker, uottawa courses",
      },
      {
        property: "og:description",
        content: "A modern schedule builder for uOttawa students",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap",
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: light)",
        href: "/favicon-light.png",
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: dark)",
        href: "/favicon-dark.png",
      },
      { rel: "canonical", href: envClient.NEXT_PUBLIC_BASE_URL },
      { rel: "stylesheet", href: shadcnCss },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <PostHogInit />
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
            <Toaster richColors position="top-right" />
          </NuqsAdapter>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
