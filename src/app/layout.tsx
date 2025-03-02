import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next";

const font = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "uEnroll",
  description: "A modern course selection tool for uOttawa students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <NuqsAdapter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: "w-[90%]",
            }}
          />
          {children}
        </NuqsAdapter>
      </body>
    </html>
  );
}
