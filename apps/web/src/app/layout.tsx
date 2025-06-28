import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./app.css";
import "@repo/ui/shadcn.css";
import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BASE_URL } from "@/utils/constants";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

const font = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "uEnroll",
    template: "%s | uEnroll",
  },
  metadataBase: new URL(BASE_URL),
  openGraph: {
    description: "A modern schedule builder for uOttawa students",
  },
  keywords: [
    "uenroll",
    "uschedule",
    "uozone",
    "uottawa",
    "university of ottawa",
    "schedule builder",
    "uottawa schedule builder",
    "uottawa schedule maker",
    "uottawa courses",
  ],
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon-light.png",
        href: "/favicon-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.png",
        href: "/favicon-dark.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                className: "w-[90%]",
              }}
            />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </NuqsAdapter>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
