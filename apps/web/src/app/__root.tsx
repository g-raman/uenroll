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
import "@/i18n";
import { useTranslation } from "react-i18next";

const siteUrl = envClient.VITE_BASE_URL;
const siteName = "uEnroll";
const siteDescription = "A modern schedule builder for uOttawa students";

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
      { title: `${siteName} - uOttawa Schedule Builder` },
      { name: "application-name", content: siteName },
      { name: "apple-mobile-web-app-title", content: siteName },
      { name: "theme-color", content: "#ffffff" },
      {
        name: "description",
        content: siteDescription,
      },
      {
        name: "keywords",
        content:
          "uenroll, uschedule, uozone, uottawa, university of ottawa, schedule builder, uottawa schedule builder, uottawa schedule maker, uottawa courses",
      },
      { property: "og:site_name", content: siteName },
      {
        property: "og:title",
        content: `${siteName} - uOttawa Schedule Builder`,
      },
      {
        property: "og:description",
        content: siteDescription,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: `${siteName} - uOttawa Schedule Builder`,
      },
      { name: "twitter:description", content: siteDescription },
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
      { rel: "canonical", href: siteUrl },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: siteName,
          url: siteUrl,
          description: siteDescription,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          audience: {
            "@type": "EducationalAudience",
            educationalRole: "student",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CAD",
          },
        }),
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const { t } = useTranslation();
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
            <Suspense fallback={<div>{t("common.loading")}</div>}>
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
